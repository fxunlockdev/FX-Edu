/**
 * Sample / stubbed affiliate data (M14). Nothing here is live — there is no
 * affiliate attribution backend wired yet. These fixtures let every page render
 * its designed state with realistic numbers. Each consumer carries a
 * `// TODO: wire …` marker at the read site.
 *
 * All figures are illustrative only and are NOT a projection of real earnings
 * (PROJECT.md §7.2 — no profit/earnings guarantees).
 */

// ── Commission program terms (single source of truth) ─────────────────────────
export const COMMISSION_TERMS = {
  basicRatePct: 20,
  proRatePct: 30,
  cookieWindowDays: 60,
  attribution: 'last-touch',
  basicPlanPriceUsd: 49,
  proPlanPriceUsd: 97,
  payoutMinimumUsd: 50,
} as const;

// ── Overview KPIs ─────────────────────────────────────────────────────────────
export interface OverviewMetric {
  key: string;
  label: string;
  value: string;
  /** Period-over-period delta copy, e.g. "+12% vs last 30d". */
  delta?: string;
  deltaTone?: 'pos' | 'neg' | 'neutral';
  hint?: string;
}

export const OVERVIEW_METRICS: ReadonlyArray<OverviewMetric> = [
  { key: 'clicks', label: 'Clicks', value: '4,128', delta: '+12% vs prev 30d', deltaTone: 'pos' },
  { key: 'signups', label: 'Signups', value: '286', delta: '+8% vs prev 30d', deltaTone: 'pos' },
  { key: 'trials', label: 'Trials started', value: '141', delta: '+5% vs prev 30d', deltaTone: 'pos' },
  { key: 'paid', label: 'Paid conversions', value: '63', delta: '+9% vs prev 30d', deltaTone: 'pos' },
  { key: 'active', label: 'Active referrals', value: '52', hint: 'Currently subscribed' },
  { key: 'mrr', label: 'MRR referred', value: '$3,940', hint: 'Gross subscription value' },
] as const;

export const PROJECTED_PAYOUT = {
  amountUsd: 1042,
  label: 'Projected next payout',
  note: 'Estimate from current active referrals at the recurring rate. Not guaranteed — refunds and chargebacks reduce earned commission.',
} as const;

/** 14-point referred-MRR trend (illustrative) for the overview sparkline. */
export const MRR_TREND: ReadonlyArray<number> = [
  1100, 1280, 1190, 1520, 1810, 1740, 2120, 2480, 2360, 2790, 3140, 3310, 3620, 3940,
];

// ── Commissions ledger ────────────────────────────────────────────────────────
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'reversed';

export interface CommissionRow {
  id: string;
  date: string; // ISO date
  referral: string; // masked referred account
  plan: 'Basic' | 'Pro';
  /** Gross subscription amount this line is computed from. */
  grossUsd: number;
  ratePct: number;
  /** Signed commission: negative on refund/chargeback adjustments. */
  commissionUsd: number;
  status: CommissionStatus;
  /** Adjustment kind for refund/chargeback rows. */
  adjustment?: 'refund' | 'chargeback';
}

export const COMMISSION_ROWS: ReadonlyArray<CommissionRow> = [
  { id: 'c_1042', date: '2026-06-18', referral: 'a***@gmail.com', plan: 'Pro', grossUsd: 97, ratePct: 30, commissionUsd: 29.1, status: 'approved' },
  { id: 'c_1041', date: '2026-06-15', referral: 'm***@outlook.com', plan: 'Basic', grossUsd: 49, ratePct: 20, commissionUsd: 9.8, status: 'approved' },
  { id: 'c_1038', date: '2026-06-11', referral: 'r***@proton.me', plan: 'Pro', grossUsd: 97, ratePct: 30, commissionUsd: 29.1, status: 'paid' },
  { id: 'c_1036', date: '2026-06-09', referral: 'k***@gmail.com', plan: 'Pro', grossUsd: 97, ratePct: 30, commissionUsd: -29.1, status: 'reversed', adjustment: 'refund' },
  { id: 'c_1031', date: '2026-06-04', referral: 't***@icloud.com', plan: 'Basic', grossUsd: 49, ratePct: 20, commissionUsd: 9.8, status: 'paid' },
  { id: 'c_1029', date: '2026-05-30', referral: 'j***@gmail.com', plan: 'Pro', grossUsd: 97, ratePct: 30, commissionUsd: -29.1, status: 'reversed', adjustment: 'chargeback' },
  { id: 'c_1024', date: '2026-05-26', referral: 's***@gmail.com', plan: 'Pro', grossUsd: 97, ratePct: 30, commissionUsd: 29.1, status: 'paid' },
  { id: 'c_1019', date: '2026-05-21', referral: 'l***@yahoo.com', plan: 'Basic', grossUsd: 49, ratePct: 20, commissionUsd: 9.8, status: 'paid' },
] as const;

// ── Payouts (Stripe Connect — stubbed) ────────────────────────────────────────
export interface PayoutBalance {
  pendingUsd: number;
  availableUsd: number;
  lifetimePaidUsd: number;
}

export const PAYOUT_BALANCE: PayoutBalance = {
  pendingUsd: 312.4,
  availableUsd: 88.2,
  lifetimePaidUsd: 2480.6,
} as const;

export interface PayoutHistoryRow {
  id: string;
  date: string;
  amountUsd: number;
  method: string;
  status: 'paid' | 'in_transit' | 'pending';
}

export const PAYOUT_HISTORY: ReadonlyArray<PayoutHistoryRow> = [
  { id: 'po_0006', date: '2026-06-01', amountUsd: 410.2, method: 'Stripe Connect', status: 'paid' },
  { id: 'po_0005', date: '2026-05-01', amountUsd: 388.4, method: 'Stripe Connect', status: 'paid' },
  { id: 'po_0004', date: '2026-04-01', amountUsd: 356.0, method: 'Stripe Connect', status: 'paid' },
] as const;

// ── Promo assets ──────────────────────────────────────────────────────────────
export interface PromoAsset {
  id: string;
  title: string;
  kind: 'banner' | 'social' | 'webinar' | 'swipe';
  /** Human-readable spec (dimensions, format, or duration). */
  spec: string;
  /** Stub download/target — replaced by signed asset URLs at wire-up. */
  href: string;
}

export const PROMO_BANNERS: ReadonlyArray<PromoAsset> = [
  { id: 'b_leaderboard', title: 'Leaderboard banner', kind: 'banner', spec: '728×90 · PNG', href: '#download-b-leaderboard' },
  { id: 'b_mpu', title: 'Medium rectangle', kind: 'banner', spec: '300×250 · PNG', href: '#download-b-mpu' },
  { id: 'b_skyscraper', title: 'Wide skyscraper', kind: 'banner', spec: '160×600 · PNG', href: '#download-b-skyscraper' },
] as const;

export const PROMO_SOCIAL: ReadonlyArray<PromoAsset> = [
  { id: 's_ig', title: 'Instagram story set', kind: 'social', spec: '1080×1920 · 3 graphics', href: '#download-s-ig' },
  { id: 's_x', title: 'X / Twitter card pack', kind: 'social', spec: '1600×900 · 4 graphics', href: '#download-s-x' },
] as const;

export const PROMO_WEBINARS: ReadonlyArray<PromoAsset> = [
  { id: 'w_intro', title: 'Free intro webinar', kind: 'webinar', spec: 'Co-branded registration link', href: '#link-w-intro' },
  { id: 'w_riskmgmt', title: 'Risk management masterclass', kind: 'webinar', spec: 'Co-branded registration link', href: '#link-w-riskmgmt' },
] as const;

export const PROMO_SWIPE: ReadonlyArray<{ id: string; title: string; body: string }> = [
  {
    id: 'sw_email',
    title: 'Email — education-first angle',
    body: 'I have been learning forex the structured way with FX Academy — courses, live webinars, a course-aware AI tutor, plus a built-in journal and risk calculator. It is education and tools only (never signals). If you want a disciplined way in, take a look:',
  },
  {
    id: 'sw_social',
    title: 'Social — short post',
    body: 'Structured forex education, live guidance, and built-in trading tools in one place. No signal-room hype — just a real curriculum and the tools to practice it. Check out FX Academy:',
  },
] as const;
