/**
 * Billing view-model + pure helpers for M16 (Billing, self-service — PROJECT.md
 * §16). No I/O lives here: the page does the RLS-scoped read, then hands the raw
 * row (or `null`) to `deriveBilling`, which maps it onto a display model and
 * decides between the ACTIVE-subscription and the FREE / no-subscription state.
 *
 * Source of truth for prices is the marketing `PLANS` catalogue — we never
 * re-state dollar amounts here, so Billing and Pricing can't drift.
 *
 * Hard rules encoded by the framing helpers (§16 🔒/✨):
 *   • changes reflect only after a Stripe webhook confirms them;
 *   • no card data is ever stored locally — Stripe owns it;
 *   • cancel keeps access until the end of the current period.
 */
import { PLANS, type Plan } from '@/app/pricing/_sections/plans';

export type { Plan } from '@/app/pricing/_sections/plans';

export type BillingInterval = 'month' | 'year';

/**
 * Subscription lifecycle states we render. Mirrors the Stripe vocabulary so the
 * mapping from a deployed `subscriptions` row is a 1:1 rename, not a reinvention.
 */
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'none';

/**
 * The shape we read from a (future) RLS-scoped `subscriptions` row. Every field
 * is nullable because the table is NOT deployed yet — the read degrades to
 * `null` and we render the Free state. Snake_case matches Postgres/Stripe.
 */
export interface SubscriptionRow {
  readonly plan_id: string | null;
  readonly status: string | null;
  readonly interval: string | null;
  /** ISO timestamp the current paid period ends / next renewal. */
  readonly current_period_end: string | null;
  /** True once the member has scheduled a cancel-at-period-end. */
  readonly cancel_at_period_end: boolean | null;
  /** Last 4 of the card on file — display only; never the full PAN. */
  readonly card_last4: string | null;
  readonly card_brand: string | null;
  readonly card_exp_month: number | null;
  readonly card_exp_year: number | null;
}

/** Columns the Billing screen selects from `subscriptions` (when deployed). */
export const SUBSCRIPTION_SELECT_COLUMNS =
  'plan_id, status, interval, current_period_end, cancel_at_period_end, card_last4, card_brand, card_exp_month, card_exp_year';

/** Card-on-file summary (display only — Stripe is the system of record). */
export interface PaymentMethodView {
  readonly brand: string;
  readonly last4: string;
  readonly expLabel: string;
}

/** The fully-derived model the page renders. */
export interface BillingView {
  /** False → no active subscription; render the Free / upgrade state. */
  readonly hasSubscription: boolean;
  readonly plan: Plan;
  readonly status: SubscriptionStatus;
  readonly interval: BillingInterval;
  /** Price for the active interval, in whole dollars. */
  readonly price: number;
  /** Human renewal line, e.g. "Renews May 18, 2026" (null on Free). */
  readonly renewalLabel: string | null;
  /** True when the member already scheduled a cancel-at-period-end. */
  readonly cancelScheduled: boolean;
  /** True when the last charge failed — drives the recovery banner. */
  readonly paymentFailed: boolean;
  /** Card on file, or null when none is stored / Free. */
  readonly paymentMethod: PaymentMethodView | null;
}

const FREE_PLAN: Plan = PLANS.find((p) => p.id === 'basic') ?? (PLANS[0] as Plan);

/** Narrow an untrusted plan_id to a known catalogue plan (defaults to Basic). */
function resolvePlanId(raw: string | null): Plan {
  return PLANS.find((p) => p.id === raw) ?? FREE_PLAN;
}

/** Narrow an untrusted interval string (defaults to monthly). */
function resolveInterval(raw: string | null): BillingInterval {
  return raw === 'year' ? 'year' : 'month';
}

/** Narrow an untrusted status string to our union (defaults to none). */
function resolveStatus(raw: string | null): SubscriptionStatus {
  switch (raw) {
    case 'active':
    case 'trialing':
    case 'past_due':
    case 'canceled':
      return raw;
    default:
      return 'none';
  }
}

/** Format an ISO timestamp as "May 18, 2026"; null-safe. */
export function formatLongDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Build the card-on-file summary, or null when nothing is stored. */
function derivePaymentMethod(row: SubscriptionRow): PaymentMethodView | null {
  if (!row.card_last4) return null;
  const mm = row.card_exp_month ? String(row.card_exp_month).padStart(2, '0') : '••';
  const yy = row.card_exp_year ? String(row.card_exp_year).slice(-2) : '••';
  return {
    brand: (row.card_brand ?? 'Card').toUpperCase(),
    last4: row.card_last4,
    expLabel: `Expires ${mm}/${yy}`,
  };
}

/**
 * Map a raw subscription row (or `null`) onto the render model.
 *
 * Degrades gracefully: a missing/undeployed table or a non-active status both
 * collapse to the FREE state (`hasSubscription: false`) so the page never errors
 * and never implies a paid plan the member doesn't have.
 */
export function deriveBilling(row: SubscriptionRow | null): BillingView {
  const status = resolveStatus(row?.status ?? null);
  const isLive = status === 'active' || status === 'trialing' || status === 'past_due';

  if (!row || !isLive) {
    return {
      hasSubscription: false,
      plan: FREE_PLAN,
      status,
      interval: 'month',
      price: 0,
      renewalLabel: null,
      cancelScheduled: false,
      paymentFailed: false,
      paymentMethod: null,
    };
  }

  const plan = resolvePlanId(row.plan_id);
  const interval = resolveInterval(row.interval);
  const price = interval === 'year' ? plan.yearly : plan.monthly;
  const periodEnd = formatLongDate(row.current_period_end);
  const cancelScheduled = row.cancel_at_period_end === true;
  const paymentFailed = status === 'past_due';

  const renewalLabel = periodEnd
    ? cancelScheduled
      ? `Access ends ${periodEnd}`
      : `Renews ${periodEnd}`
    : null;

  return {
    hasSubscription: true,
    plan,
    status,
    interval,
    price,
    renewalLabel,
    cancelScheduled,
    paymentFailed,
    paymentMethod: derivePaymentMethod(row),
  };
}

/** Format a whole-dollar amount as "$58.00". */
export function formatMoney(dollars: number): string {
  return `$${dollars.toFixed(2)}`;
}

/** A billing-history line item (one past invoice). */
export interface InvoiceRow {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly amount: string;
}

/**
 * Billing history is STUBBED until Stripe invoices are wired (no card data, no
 * live charges yet). When there is no active subscription we return an empty
 * list (the table renders its empty state); for an active plan we synthesize a
 * short, clearly-illustrative sample so the layout and receipt affordance are
 * reviewable. // TODO: replace with real Stripe invoices via the API.
 */
export function sampleInvoices(view: BillingView): ReadonlyArray<InvoiceRow> {
  if (!view.hasSubscription) return [];
  const label = `${view.plan.name} ${view.interval === 'year' ? 'Yearly' : 'Monthly'}`;
  const amount = formatMoney(view.price);
  // Illustrative only — three trailing periods. Not real financial records.
  return [
    { id: 'sample-1', date: 'Apr 18, 2026', description: label, amount },
    { id: 'sample-2', date: 'Mar 18, 2026', description: label, amount },
    { id: 'sample-3', date: 'Feb 18, 2026', description: label, amount },
  ];
}

/** Plan id of the next tier up, for the upgrade CTA (null at the top tier). */
export function upgradeTargetId(plan: Plan): Plan['id'] | null {
  if (plan.id === 'basic') return 'pro';
  if (plan.id === 'pro') return 'elite';
  return null;
}
