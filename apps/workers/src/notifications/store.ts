import { eq } from "drizzle-orm";

import type { Database } from "@fxunlock/db";
import { notificationPreferences, notifications } from "@fxunlock/db/schema";

import type { PreferenceRow } from "./preferences.js";

/**
 * Data access for notifications + preferences.
 *
 * Thin repository over @fxunlock/db. The worker runs as the service role, so it
 * reads/writes across orgs directly (no per-request RLS GUCs) — it is trusted
 * infrastructure, not a tenant request path.
 */

/** Payload stored on an in-app notification row (title/body/deep-link). */
export interface InAppPayload {
  readonly title: string;
  readonly body: string;
  /** Deep-link the inbox row navigates to on click. */
  readonly url?: string;
  /** Optional entity refs for rendering (e.g. { certificateId }). */
  readonly refs?: Readonly<Record<string, string>>;
}

/** A notification type — must be a value of the DB `notification_type` enum. */
export type NotificationType =
  | "webinar_reminder"
  | "new_trade_idea"
  | "community_reply"
  | "post_reaction"
  | "weekly_digest"
  | "product_update"
  | "certificate_earned"
  | "certificate_progress"
  | "failed_payment"
  | "affiliate_payout"
  | "partner_domain_verification";

export interface NotificationStore {
  loadPreferences(userId: string): Promise<ReadonlyArray<PreferenceRow>>;
  writeInApp(args: {
    orgId: string;
    userId: string;
    type: NotificationType;
    payload: InAppPayload;
  }): Promise<void>;
}

/**
 * Drizzle-backed store. Pass `null` in tests to use an in-memory fake instead
 * (see preferences.test.ts), keeping the dispatcher decoupled from a live DB.
 */
export function createNotificationStore(db: Database): NotificationStore {
  return {
    async loadPreferences(userId: string): Promise<ReadonlyArray<PreferenceRow>> {
      const rows = await db
        .select({
          channel: notificationPreferences.channel,
          type: notificationPreferences.type,
          enabled: notificationPreferences.enabled,
        })
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));
      return rows.map((row) => ({
        channel: row.channel,
        type: row.type,
        enabled: row.enabled,
      }));
    },

    async writeInApp({ orgId, userId, type, payload }): Promise<void> {
      await db.insert(notifications).values({
        orgId,
        userId,
        type,
        payload,
      });
    },
  };
}
