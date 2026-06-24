/**
 * Pricing plan data — ported from design/public/pricing.html.
 *
 * Prices are advertised monthly; the yearly figure is the effective monthly
 * rate when billed annually (≈20% saving). No profit-guarantee or
 * financial-advice copy anywhere (PROJECT.md §5).
 */

export interface PlanFeature {
  /** Feature label. */
  label: string;
  /** Whether this plan includes the feature. */
  included: boolean;
}

export interface Plan {
  /** Plan id, also used in the `?plan=` query param. */
  id: 'basic' | 'pro' | 'elite';
  name: string;
  /** Monthly price in whole dollars. */
  monthly: number;
  /** Effective monthly price when billed yearly. */
  yearly: number;
  /** One-line positioning under the price. */
  sub: string;
  /** CTA label. */
  cta: string;
  /** Base CTA href (referral + plan are appended at render time). */
  href: string;
  /** Pro is the highlighted "most popular" card. */
  highlight?: boolean;
  /** Elite is pre-launch: price shown as a "from" floor + waitlist CTA. */
  comingSoon?: boolean;
  features: ReadonlyArray<PlanFeature>;
}

export const PLANS: ReadonlyArray<Plan> = [
  {
    id: 'basic',
    name: 'Basic',
    monthly: 49,
    yearly: 39,
    sub: 'Entry-level hook',
    cta: 'Start Basic',
    href: '/checkout?plan=basic',
    features: [
      { label: 'Entry + Beginner courses', included: true },
      { label: 'Custom trade journal', included: true },
      { label: 'Risk calculator', included: true },
      { label: 'Video library access', included: true },
      { label: 'Full curriculum + Trading Psychology', included: false },
      { label: 'Weekly live webinars + replays', included: false },
      { label: 'AI learning agents', included: false },
      { label: 'Performance analytics', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 97,
    yearly: 78,
    sub: 'Most complete',
    cta: 'Start Pro',
    href: '/checkout?plan=pro',
    highlight: true,
    features: [
      { label: 'Full curriculum + Trading Psychology', included: true },
      { label: 'Weekly live webinars + replays', included: true },
      { label: 'AI learning agents', included: true },
      { label: 'Performance analytics', included: true },
      { label: 'Community + accountability pods', included: true },
      { label: 'Trade idea feed', included: true },
      { label: 'Journal + risk calculator', included: true },
      { label: 'Certificates at every tier', included: true },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    monthly: 147,
    yearly: 118,
    sub: 'Final pricing set at launch',
    cta: 'Join Elite Waitlist',
    href: '/checkout?plan=elite',
    comingSoon: true,
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Prop firm prep track', included: true },
      { label: 'Educator Q&A', included: true },
      { label: 'Monthly live coaching call', included: true },
      { label: 'Early access to new content', included: true },
      { label: 'Smaller cohort / high-touch', included: true },
    ],
  },
] as const;

/** Rows for the side-by-side feature comparison table. */
export interface ComparisonRow {
  label: string;
  basic: boolean;
  pro: boolean;
  elite: boolean;
}

export const COMPARISON_ROWS: ReadonlyArray<ComparisonRow> = [
  { label: 'Entry + Beginner courses', basic: true, pro: true, elite: true },
  { label: 'Custom trade journal', basic: true, pro: true, elite: true },
  { label: 'Risk calculator', basic: true, pro: true, elite: true },
  { label: 'Video library access', basic: true, pro: true, elite: true },
  { label: 'Full curriculum + Trading Psychology', basic: false, pro: true, elite: true },
  { label: 'Weekly live webinars + replays', basic: false, pro: true, elite: true },
  { label: 'AI learning agents', basic: false, pro: true, elite: true },
  { label: 'Performance analytics', basic: false, pro: true, elite: true },
  { label: 'Community + accountability pods', basic: false, pro: true, elite: true },
  { label: 'Certificates at every tier', basic: false, pro: true, elite: true },
  { label: 'Prop firm prep track', basic: false, pro: false, elite: true },
  { label: 'Monthly live coaching call', basic: false, pro: false, elite: true },
  { label: 'Educator Q&A', basic: false, pro: false, elite: true },
];

export const FAQ_ITEMS: ReadonlyArray<readonly [string, string]> = [
  [
    'Can I cancel anytime?',
    'Yes. Cancel from Billing in one click. You keep access until the end of your current billing cycle, and your journal and certificates remain available.',
  ],
  [
    'Is this financial advice?',
    'No. FX Academy is an educational platform. Nothing here is financial advice, and we never guarantee trading outcomes. Forex trading involves substantial risk.',
  ],
  [
    'Do I need trading experience?',
    'None at all. The Entry tier starts from first principles: what forex is, how markets move, brokers and risk basics.',
  ],
  [
    'Are webinars recorded?',
    'Every live session is recorded and saved to your replay library (Pro). You also get transcripts and AI summaries.',
  ],
  [
    'Can I upgrade later?',
    'Anytime. Upgrading unlocks locked content instantly and preserves all your progress. Downgrading keeps your raw journal data.',
  ],
  [
    'Do you offer white-label options?',
    'Yes. Coaches, prop firms and academies can run FX Academy under their own brand and domain. See our White Label page.',
  ],
  [
    'How do affiliate referrals work?',
    'Affiliates earn recurring commission on referred subscribers, tracked transparently with Stripe Connect payouts. See the Affiliates page.',
  ],
] as const;
