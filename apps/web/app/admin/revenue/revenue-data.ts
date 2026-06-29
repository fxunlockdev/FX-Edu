/**
 * Sample revenue data for the Admin Revenue screen (PROJECT.md §9 module 19
 * "Revenue: subs, invoices, refunds, failed payments, coupons"). STUBBED.
 *
 * Source of truth in production is Stripe webhooks written idempotently into
 * `subscriptions` + `entitlements`, healed by a nightly reconciliation job
 * (§6.2). Refunds are dangerous mutations (step-up + reason, §6.1 / §6.7).
 *
 * // TODO: replace with the admin revenue API backed by Stripe.
 */

export type InvoiceStatus = 'paid' | 'failed' | 'refunded';

export interface InvoiceRow {
  id: string;
  member: string;
  plan: string;
  amount: string;
  status: InvoiceStatus;
  date: string;
}

export interface CouponRow {
  code: string;
  discount: string;
  redemptions: number;
  expires: string;
}

export interface RevenueStat {
  label: string;
  value: string;
}

export const REVENUE_STATS: readonly RevenueStat[] = [
  { label: 'MRR', value: '$184,500' },
  { label: 'Active subscriptions', value: '9,310' },
  { label: 'Failed payments (30d)', value: '42' },
  { label: 'Refunds (30d)', value: '$2,140' },
] as const;

export const SAMPLE_INVOICES: readonly InvoiceRow[] = [
  { id: 'in_9f21', member: 'alex.rivera@example.com', plan: 'Pro · monthly', amount: '$39.00', status: 'paid', date: '2026-06-24' },
  { id: 'in_8c04', member: 'priya.nair@example.com', plan: 'Elite · annual', amount: '$390.00', status: 'paid', date: '2026-06-22' },
  { id: 'in_7b55', member: 'marcus.vale@example.com', plan: 'Basic · monthly', amount: '$0.00', status: 'failed', date: '2026-06-21' },
  { id: 'in_6a18', member: 'hana.kimura@example.com', plan: 'Pro · monthly', amount: '$39.00', status: 'refunded', date: '2026-06-19' },
  { id: 'in_5d77', member: 'lena.osei@example.com', plan: 'Elite · monthly', amount: '$59.00', status: 'paid', date: '2026-06-18' },
] as const;

export const SAMPLE_COUPONS: readonly CouponRow[] = [
  { code: 'LAUNCH25', discount: '25% off first 3 months', redemptions: 412, expires: '2026-07-31' },
  { code: 'PROPFIRM', discount: '$20 off annual', redemptions: 88, expires: '2026-09-30' },
  { code: 'WINBACK', discount: '50% off 1 month', redemptions: 36, expires: '2026-08-15' },
] as const;
