import { z } from 'zod';
import { IsoTimestampSchema, PlanSchema } from './common.js';

/**
 * Billing domain:
 *   POST /checkout/session
 *   POST /billing/portal-session
 *
 * (PRD §8.2, §8.15, §11). We never touch card data — Stripe hosts Checkout and
 * the Customer Portal. Subscription state is webhook-driven elsewhere.
 */

/** Billing interval offered at checkout. */
export const BillingIntervalSchema = z.enum(['monthly', 'yearly']);
export type BillingInterval = z.infer<typeof BillingIntervalSchema>;

/** Request body for `POST /checkout/session`. */
export const CheckoutSessionRequestSchema = z.object({
  /** Elite is waitlist-only in v1, so checkout accepts basic|pro. */
  plan: z.enum(['basic', 'pro']),
  interval: BillingIntervalSchema,
  /** Optional coupon code; validated server-side against Stripe. */
  couponCode: z.string().trim().min(1).max(64).optional(),
  /** Referral code captured from `?ref=`; sanitized before use. */
  referralCode: z.string().trim().min(1).max(64).optional(),
  /** Where Stripe returns the user on success / cancel. */
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});
export type CheckoutSessionRequest = z.infer<typeof CheckoutSessionRequestSchema>;

/** Response for `POST /checkout/session` — redirect target. */
export const CheckoutSessionResponseSchema = z.object({
  /** Stripe-hosted Checkout URL. */
  url: z.string().url(),
  sessionId: z.string().min(1),
});
export type CheckoutSessionResponse = z.infer<typeof CheckoutSessionResponseSchema>;

/** Request body for `POST /billing/portal-session`. */
export const PortalSessionRequestSchema = z.object({
  /** Where Stripe returns the user after they leave the portal. */
  returnUrl: z.string().url(),
});
export type PortalSessionRequest = z.infer<typeof PortalSessionRequestSchema>;

/** Response for `POST /billing/portal-session`. */
export const PortalSessionResponseSchema = z.object({
  url: z.string().url(),
});
export type PortalSessionResponse = z.infer<typeof PortalSessionResponseSchema>;

/** Current subscription summary used by the billing screen (PRD §8.15). */
export const SubscriptionSummarySchema = z.object({
  plan: PlanSchema,
  interval: BillingIntervalSchema,
  priceCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  currentPeriodEnd: IsoTimestampSchema,
  cancelAtPeriodEnd: z.boolean(),
});
export type SubscriptionSummary = z.infer<typeof SubscriptionSummarySchema>;
