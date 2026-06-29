import type { Logger } from "pino";

import type { Mailer } from "../email/mailer.js";
import type { RenderedEmail } from "../email/templates/index.js";
import { mayEmail, mayNotifyInApp } from "./preferences.js";
import type {
  InAppPayload,
  NotificationStore,
  NotificationType,
} from "./store.js";

/**
 * Preference-respecting notification dispatcher (PRD §8.16).
 *
 * A handler resolves an event into a `ResolvedNotification` (which channels,
 * what to render); the dispatcher loads the user's preferences ONCE and fans
 * out only to the channels they haven't opted out of. Opted-out users are never
 * emailed and get no in-app row for that type.
 *
 * The two channels are independent: a user can keep in-app on but email off.
 * Email failure does NOT block the in-app write (and vice-versa); the caller
 * decides retry semantics from the returned result.
 */
export interface ResolvedNotification {
  readonly orgId: string;
  readonly userId: string;
  readonly type: NotificationType;
  readonly recipientEmail: string;
  /** Rendered email (subject/html/text) — only sent if email is enabled. */
  readonly email: RenderedEmail;
  /** In-app inbox payload — only written if in-app is enabled. */
  readonly inApp: InAppPayload;
}

export interface DispatchResult {
  readonly emailSent: boolean;
  readonly emailSkipped: boolean;
  readonly inAppWritten: boolean;
  readonly inAppSkipped: boolean;
  /** True when a channel was attempted but failed (caller may retry). */
  readonly hadError: boolean;
}

export interface Dispatcher {
  dispatch(notification: ResolvedNotification): Promise<DispatchResult>;
}

export function createDispatcher(deps: {
  store: NotificationStore;
  mailer: Mailer;
  logger: Logger;
}): Dispatcher {
  const { store, mailer, logger } = deps;

  return {
    async dispatch(n: ResolvedNotification): Promise<DispatchResult> {
      const preferences = await store.loadPreferences(n.userId);
      const emailAllowed = mayEmail(preferences, n.type);
      const inAppAllowed = mayNotifyInApp(preferences, n.type);

      let emailSent = false;
      let inAppWritten = false;
      let hadError = false;

      // In-app first: cheap, local, and the inbox is the durable record.
      if (inAppAllowed) {
        try {
          await store.writeInApp({
            orgId: n.orgId,
            userId: n.userId,
            type: n.type,
            payload: n.inApp,
          });
          inAppWritten = true;
        } catch (error: unknown) {
          hadError = true;
          logger.error(
            { err: messageOf(error), type: n.type, userId: n.userId },
            "dispatch.in_app.failed",
          );
        }
      }

      if (emailAllowed) {
        const result = await mailer.send({
          to: n.recipientEmail,
          subject: n.email.subject,
          html: n.email.html,
          text: n.email.text,
        });
        if (result.ok) {
          emailSent = true;
        } else {
          hadError = true;
          logger.warn(
            { type: n.type, userId: n.userId, err: result.error },
            "dispatch.email.failed",
          );
        }
      }

      return Object.freeze({
        emailSent,
        emailSkipped: !emailAllowed,
        inAppWritten,
        inAppSkipped: !inAppAllowed,
        hadError,
      });
    },
  };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
