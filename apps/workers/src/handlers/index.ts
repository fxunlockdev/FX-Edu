/**
 * Event → notification handlers (M15).
 *
 * Each handler maps one outbox event type to a ResolvedNotification: it
 * validates the payload with its Zod schema, picks the matching §8.16 template,
 * builds the in-app inbox payload, and tags the correct `notification_type`.
 * Handlers are pure (payload → notification); the dispatcher does the I/O.
 *
 * Mapped events (per task): certificate.issued, subscription.past_due,
 * webinar.reminder_due, commission.earned, partner.domain_verified.
 */
import {
  affiliatePayoutEmail,
  certificateEarnedEmail,
  failedPaymentEmail,
  partnerDomainVerificationEmail,
  webinarReminderEmail,
} from "../email/templates/index.js";
import type { ResolvedNotification } from "../notifications/dispatcher.js";
import {
  certificateIssuedPayload,
  commissionEarnedPayload,
  partnerDomainVerifiedPayload,
  subscriptionPastDuePayload,
  webinarReminderDuePayload,
  type HandledEventType,
} from "../events/types.js";

/** A handler turns a raw outbox payload into a notification to fan out. */
export type EventHandler = (rawPayload: unknown) => ResolvedNotification;

export const HANDLERS: Readonly<Record<HandledEventType, EventHandler>> = {
  "certificate.issued": (raw) => {
    const p = certificateIssuedPayload.parse(raw);
    return {
      orgId: p.orgId,
      userId: p.userId,
      type: "certificate_earned",
      recipientEmail: p.email,
      email: certificateEarnedEmail({
        name: p.name,
        courseTitle: p.courseTitle,
        certificateUrl: p.certificateUrl,
      }),
      inApp: {
        title: "Certificate earned",
        body: `You completed ${p.courseTitle}. Your certificate is ready.`,
        url: p.certificateUrl,
        refs: { certificateId: p.certificateId },
      },
    };
  },

  "subscription.past_due": (raw) => {
    const p = subscriptionPastDuePayload.parse(raw);
    return {
      orgId: p.orgId,
      userId: p.userId,
      type: "failed_payment",
      recipientEmail: p.email,
      email: failedPaymentEmail({
        name: p.name,
        planName: p.planName,
        amountDue: p.amountDue,
        updatePaymentUrl: p.updatePaymentUrl,
        gracePeriodEndsAt: p.gracePeriodEndsAt,
      }),
      inApp: {
        title: "Payment failed",
        body: `Your payment of ${p.amountDue} for ${p.planName} didn't go through. Update your payment method to keep access.`,
        url: p.updatePaymentUrl,
      },
    };
  },

  "webinar.reminder_due": (raw) => {
    const p = webinarReminderDuePayload.parse(raw);
    return {
      orgId: p.orgId,
      userId: p.userId,
      type: "webinar_reminder",
      recipientEmail: p.email,
      email: webinarReminderEmail({
        name: p.name,
        webinarTitle: p.webinarTitle,
        startsAt: p.startsAt,
        joinUrl: p.joinUrl,
        leadTime: p.leadTime,
      }),
      inApp: {
        title: "Webinar starting soon",
        body: `"${p.webinarTitle}" starts ${p.startsAt} (in ${p.leadTime}).`,
        url: p.joinUrl,
      },
    };
  },

  "commission.earned": (raw) => {
    const p = commissionEarnedPayload.parse(raw);
    return {
      orgId: p.orgId,
      userId: p.userId,
      type: "affiliate_payout",
      recipientEmail: p.email,
      email: affiliatePayoutEmail({
        name: p.name,
        amount: p.amount,
        currency: p.currency,
        referralLabel: p.referralLabel,
        dashboardUrl: p.dashboardUrl,
      }),
      inApp: {
        title: "Commission earned",
        body: `You earned ${p.amount} ${p.currency} from ${p.referralLabel}.`,
        url: p.dashboardUrl,
      },
    };
  },

  "partner.domain_verified": (raw) => {
    const p = partnerDomainVerifiedPayload.parse(raw);
    return {
      orgId: p.orgId,
      userId: p.userId,
      type: "partner_domain_verification",
      recipientEmail: p.email,
      email: partnerDomainVerificationEmail({
        name: p.name,
        domain: p.domain,
        partnerName: p.partnerName,
        consoleUrl: p.consoleUrl,
      }),
      inApp: {
        title: "Domain verified",
        body: `${p.domain} is verified and active for ${p.partnerName}.`,
        url: p.consoleUrl,
      },
    };
  },
};

export function getHandler(eventType: string): EventHandler | undefined {
  return Object.prototype.hasOwnProperty.call(HANDLERS, eventType)
    ? HANDLERS[eventType as HandledEventType]
    : undefined;
}
