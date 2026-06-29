import { z } from "zod";

/**
 * Lifecycle event taxonomy consumed from `event_outbox` (PROJECT.md §6, F3).
 *
 * The core API/services write rows into the transactional outbox; this worker
 * claims them and fans out to email + in-app notifications. Each event name
 * maps (in src/handlers) to a notification type + template. Payloads are
 * validated with Zod at the boundary — outbox rows are untrusted input
 * (ENGINEERING.md: "validate at every boundary with Zod").
 *
 * Only the M15-relevant events are typed here; unknown event types are skipped
 * (acked) by the dispatcher so unrelated outbox traffic never blocks the queue.
 */

/** Common envelope present on every event payload (who/where it's about). */
const baseEvent = z.object({
  /** Tenant the event belongs to (system org for global events). */
  orgId: z.string().uuid(),
  /** The user who should receive the resulting notification. */
  userId: z.string().uuid(),
  /** Recipient email (snapshot at publish time; may be re-resolved). */
  email: z.string().email(),
  /** Recipient display name for greetings; falls back to "there". */
  name: z.string().min(1).optional(),
});

export const certificateIssuedPayload = baseEvent.extend({
  courseTitle: z.string().min(1),
  certificateUrl: z.string().url(),
  certificateId: z.string().uuid(),
});

export const subscriptionPastDuePayload = baseEvent.extend({
  planName: z.string().min(1),
  amountDue: z.string().min(1),
  updatePaymentUrl: z.string().url(),
  gracePeriodEndsAt: z.string().optional(),
});

export const webinarReminderDuePayload = baseEvent.extend({
  webinarTitle: z.string().min(1),
  startsAt: z.string().min(1),
  joinUrl: z.string().url(),
  /** Lead time bucket, e.g. "24h" | "1h" | "30m" (PRD §8 webinar reminders). */
  leadTime: z.string().min(1),
});

export const commissionEarnedPayload = baseEvent.extend({
  amount: z.string().min(1),
  currency: z.string().min(1),
  referralLabel: z.string().min(1),
  dashboardUrl: z.string().url(),
});

export const partnerDomainVerifiedPayload = baseEvent.extend({
  domain: z.string().min(1),
  partnerName: z.string().min(1),
  consoleUrl: z.string().url(),
});

/** Discriminated union of every handled event. `type` matches the outbox row. */
export const EVENT_SCHEMAS = {
  "certificate.issued": certificateIssuedPayload,
  "subscription.past_due": subscriptionPastDuePayload,
  "webinar.reminder_due": webinarReminderDuePayload,
  "commission.earned": commissionEarnedPayload,
  "partner.domain_verified": partnerDomainVerifiedPayload,
} as const;

export type HandledEventType = keyof typeof EVENT_SCHEMAS;

export type EventPayload<T extends HandledEventType> = z.infer<
  (typeof EVENT_SCHEMAS)[T]
>;

export function isHandledEventType(value: string): value is HandledEventType {
  return Object.prototype.hasOwnProperty.call(EVENT_SCHEMAS, value);
}

/** A claimed outbox row, minimally typed for the dispatcher. */
export interface OutboxEvent {
  readonly id: string;
  readonly eventType: string;
  readonly orgId: string | null;
  readonly payload: unknown;
  readonly attempts: number;
}
