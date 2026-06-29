import { describe, expect, it, vi } from "vitest";

import type { Mailer } from "../email/mailer.js";
import { createDispatcher, type ResolvedNotification } from "./dispatcher.js";
import {
  isChannelEnabled,
  mayEmail,
  mayNotifyInApp,
  resolveChannels,
  type PreferenceRow,
} from "./preferences.js";
import type {
  InAppPayload,
  NotificationStore,
  NotificationType,
} from "./store.js";

/* ── pure preference resolution ─────────────────────────────────────── */

describe("preference resolution (pure)", () => {
  it("allows a channel when no preference row exists (opt-out model)", () => {
    expect(isChannelEnabled([], "email", "weekly_digest")).toBe(true);
    expect(isChannelEnabled([], "in_app", "weekly_digest")).toBe(true);
  });

  it("suppresses a channel with an explicit enabled=false row", () => {
    const prefs: PreferenceRow[] = [
      { channel: "email", type: "weekly_digest", enabled: false },
    ];
    expect(mayEmail(prefs, "weekly_digest")).toBe(false);
    // in-app for the same type is independent and still allowed
    expect(mayNotifyInApp(prefs, "weekly_digest")).toBe(true);
  });

  it("scopes a preference row to its exact type", () => {
    const prefs: PreferenceRow[] = [
      { channel: "email", type: "weekly_digest", enabled: false },
    ];
    // a different type is unaffected
    expect(mayEmail(prefs, "webinar_reminder")).toBe(true);
  });

  it("resolveChannels returns a decision per channel", () => {
    const prefs: PreferenceRow[] = [
      { channel: "email", type: "new_trade_idea", enabled: false },
    ];
    const decisions = resolveChannels(prefs, "new_trade_idea");
    expect(decisions).toEqual([
      { channel: "in_app", allowed: true },
      { channel: "email", allowed: false },
    ]);
  });
});

/* ── preference-respecting dispatch ─────────────────────────────────── */

interface InAppWrite {
  orgId: string;
  userId: string;
  type: NotificationType;
  payload: InAppPayload;
}

function fakeStore(prefs: ReadonlyArray<PreferenceRow>): {
  store: NotificationStore;
  writes: InAppWrite[];
} {
  const writes: InAppWrite[] = [];
  const store: NotificationStore = {
    loadPreferences: async () => prefs,
    writeInApp: async (args) => {
      writes.push(args);
    },
  };
  return { store, writes };
}

function fakeMailer(ok = true): Mailer & { sends: number } {
  return {
    kind: "log" as const,
    sends: 0,
    async send() {
      this.sends += 1;
      return ok ? { ok: true, id: "fake" } : { ok: false, error: "boom" };
    },
  } as Mailer & { sends: number };
}

const notification: ResolvedNotification = {
  orgId: "00000000-0000-0000-0000-0000000000aa",
  userId: "00000000-0000-0000-0000-0000000000bb",
  type: "weekly_digest",
  recipientEmail: "user@example.com",
  email: { subject: "s", html: "<p>h</p>", text: "t" },
  inApp: { title: "Weekly", body: "Your week" },
};

const silentLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
} as unknown as Parameters<typeof createDispatcher>[0]["logger"];

describe("dispatcher (preference-respecting fan-out)", () => {
  it("fans out to both channels when nothing is opted out", async () => {
    const { store, writes } = fakeStore([]);
    const mailer = fakeMailer();
    const dispatcher = createDispatcher({ store, mailer, logger: silentLogger });

    const result = await dispatcher.dispatch(notification);

    expect(result.emailSent).toBe(true);
    expect(result.inAppWritten).toBe(true);
    expect(mailer.sends).toBe(1);
    expect(writes).toHaveLength(1);
    expect(result.hadError).toBe(false);
  });

  it("does NOT email an opted-out user but still writes in-app", async () => {
    const { store, writes } = fakeStore([
      { channel: "email", type: "weekly_digest", enabled: false },
    ]);
    const mailer = fakeMailer();
    const dispatcher = createDispatcher({ store, mailer, logger: silentLogger });

    const result = await dispatcher.dispatch(notification);

    expect(result.emailSent).toBe(false);
    expect(result.emailSkipped).toBe(true);
    expect(mailer.sends).toBe(0); // critical: never sent
    expect(result.inAppWritten).toBe(true);
    expect(writes).toHaveLength(1);
  });

  it("writes no in-app row when in-app is opted out", async () => {
    const { store, writes } = fakeStore([
      { channel: "in_app", type: "weekly_digest", enabled: false },
    ]);
    const mailer = fakeMailer();
    const dispatcher = createDispatcher({ store, mailer, logger: silentLogger });

    const result = await dispatcher.dispatch(notification);

    expect(result.inAppWritten).toBe(false);
    expect(result.inAppSkipped).toBe(true);
    expect(writes).toHaveLength(0);
    expect(result.emailSent).toBe(true);
  });

  it("flags hadError when the mailer fails, leaving retry to the caller", async () => {
    const { store } = fakeStore([]);
    const mailer = fakeMailer(false);
    const dispatcher = createDispatcher({ store, mailer, logger: silentLogger });

    const result = await dispatcher.dispatch(notification);

    expect(result.hadError).toBe(true);
    expect(result.emailSent).toBe(false);
    expect(result.inAppWritten).toBe(true);
  });
});
