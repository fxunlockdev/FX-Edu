/**
 * Billing / affiliate / partner email templates (PRD §8.16).
 *
 * Pure functions of typed props → RenderedEmail (no I/O). Covers:
 * failed payment, affiliate payout, partner domain verification.
 *
 * These carry money/account semantics, so copy is plain and actionable and
 * never makes promises about timing the worker can't guarantee.
 */
import { button, esc, greeting, layout, type RenderedEmail } from "./layout.js";

export interface FailedPaymentProps {
  readonly name?: string;
  readonly planName: string;
  readonly amountDue: string;
  readonly updatePaymentUrl: string;
  readonly gracePeriodEndsAt?: string;
}

export function failedPaymentEmail(p: FailedPaymentProps): RenderedEmail {
  const grace = p.gracePeriodEndsAt
    ? `<p>To keep your access uninterrupted, please update your payment method before <strong>${esc(p.gracePeriodEndsAt)}</strong>.</p>`
    : `<p>Please update your payment method to keep your subscription active.</p>`;
  const graceText = p.gracePeriodEndsAt
    ? `Update your payment method before ${p.gracePeriodEndsAt} to avoid losing access.`
    : `Please update your payment method to keep your subscription active.`;
  return layout({
    subject: `Action needed: payment failed for ${p.planName}`,
    heading: "We couldn't process your payment",
    bodyHtml: `<p>${greeting(p.name)}</p>
      <p>Your most recent payment of <strong>${esc(p.amountDue)}</strong> for the <strong>${esc(p.planName)}</strong> plan didn't go through.</p>
      ${grace}
      <p style="margin:22px 0">${button("Update payment method", p.updatePaymentUrl)}</p>`,
    bodyText: `Your payment of ${p.amountDue} for ${p.planName} failed. ${graceText} Update: ${p.updatePaymentUrl}`,
  });
}

export interface AffiliatePayoutProps {
  readonly name?: string;
  readonly amount: string;
  readonly currency: string;
  readonly referralLabel: string;
  readonly dashboardUrl: string;
}

export function affiliatePayoutEmail(p: AffiliatePayoutProps): RenderedEmail {
  return layout({
    subject: `Commission earned: ${p.amount} ${p.currency}`,
    heading: "You earned a commission",
    bodyHtml: `<p>${greeting(p.name)}</p>
      <p>You earned <strong>${esc(p.amount)} ${esc(p.currency)}</strong> from ${esc(p.referralLabel)}.</p>
      <p>It will be included in your next Stripe Connect payout once it clears the standard holding period.</p>
      <p style="margin:22px 0">${button("View your earnings", p.dashboardUrl)}</p>`,
    bodyText: `You earned ${p.amount} ${p.currency} from ${p.referralLabel}. View: ${p.dashboardUrl}`,
  });
}

export interface PartnerDomainVerificationProps {
  readonly name?: string;
  readonly domain: string;
  readonly partnerName: string;
  readonly consoleUrl: string;
}

export function partnerDomainVerificationEmail(
  p: PartnerDomainVerificationProps,
): RenderedEmail {
  return layout({
    subject: `Domain verified: ${p.domain}`,
    heading: "Your custom domain is verified",
    bodyHtml: `<p>${greeting(p.name)}</p>
      <p>The domain <strong>${esc(p.domain)}</strong> for <strong>${esc(p.partnerName)}</strong> has been verified and is now active.</p>
      <p style="margin:22px 0">${button("Open partner console", p.consoleUrl)}</p>`,
    bodyText: `${p.domain} for ${p.partnerName} is verified and active. Console: ${p.consoleUrl}`,
  });
}
