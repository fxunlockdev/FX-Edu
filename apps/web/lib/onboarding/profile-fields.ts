/**
 * Trading-profile field definitions for onboarding (PROJECT.md §9 module 2:
 * "post-payment trading profile — experience, goal, account size, risk comfort,
 * source"). Option labels are ported verbatim from the design prototype
 * (design/public/checkout.html, step 4) so the built flow matches the approved
 * UX. Values are stable machine keys persisted to `profiles`.
 *
 * Single source of truth: the onboarding form, checkout's profile step, and the
 * `profiles` write all read these so options can never drift apart.
 */

export interface ProfileOption {
  /** Stable value persisted to the DB. */
  readonly value: string;
  /** Human label shown in the UI. */
  readonly label: string;
}

export const EXPERIENCE_OPTIONS: ReadonlyArray<ProfileOption> = [
  { value: 'new', label: 'New to forex' },
  { value: 'some_charting', label: 'Some charting experience' },
  { value: 'actively_trading', label: 'Actively trading' },
  { value: 'prop_firm', label: 'Preparing for prop firm' },
] as const;

export const GOAL_OPTIONS: ReadonlyArray<ProfileOption> = [
  { value: 'learn_fundamentals', label: 'Learn fundamentals' },
  { value: 'build_consistency', label: 'Build consistency' },
  { value: 'pass_prop_firm', label: 'Pass prop firm challenge' },
  { value: 'improve_psychology', label: 'Improve psychology' },
  { value: 'track_performance', label: 'Track performance' },
] as const;

export const ACCOUNT_SIZE_OPTIONS: ReadonlyArray<ProfileOption> = [
  { value: '1000', label: '$1,000' },
  { value: '5000', label: '$5,000' },
  { value: '10000', label: '$10,000' },
  { value: '25000', label: '$25,000' },
  { value: '50000_plus', label: '$50,000+' },
] as const;

export const RISK_COMFORT_OPTIONS: ReadonlyArray<ProfileOption> = [
  { value: 'conservative', label: 'Conservative (0.5%)' },
  { value: 'balanced', label: 'Balanced (1%)' },
  { value: 'aggressive', label: 'Aggressive (2%)' },
] as const;

export const SOURCE_OPTIONS: ReadonlyArray<ProfileOption> = [
  { value: 'affiliate', label: 'Affiliate / creator' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'friend', label: 'Friend' },
  { value: 'search', label: 'Search' },
] as const;

/** Shape of a completed trading profile persisted to `profiles`. */
export interface TradingProfile {
  experience: string;
  goal: string;
  accountSize: string;
  riskComfort: string;
  source: string;
}

const VALUE_SETS = {
  experience: new Set(EXPERIENCE_OPTIONS.map((o) => o.value)),
  goal: new Set(GOAL_OPTIONS.map((o) => o.value)),
  accountSize: new Set(ACCOUNT_SIZE_OPTIONS.map((o) => o.value)),
  riskComfort: new Set(RISK_COMFORT_OPTIONS.map((o) => o.value)),
  source: new Set(SOURCE_OPTIONS.map((o) => o.value)),
} as const;

/**
 * Validates an untrusted partial profile (e.g. restored from storage or posted
 * from the client) against the allowed option values. Returns a fully-typed
 * profile or `null` if any field is missing/invalid — never trust external data
 * (ENGINEERING.md: "Validate at every boundary").
 */
export function parseTradingProfile(input: Partial<Record<keyof TradingProfile, string>>): TradingProfile | null {
  const experience = input.experience ?? '';
  const goal = input.goal ?? '';
  const accountSize = input.accountSize ?? '';
  const riskComfort = input.riskComfort ?? '';
  const source = input.source ?? '';

  if (!VALUE_SETS.experience.has(experience)) return null;
  if (!VALUE_SETS.goal.has(goal)) return null;
  if (!VALUE_SETS.accountSize.has(accountSize)) return null;
  if (!VALUE_SETS.riskComfort.has(riskComfort)) return null;
  if (!VALUE_SETS.source.has(source)) return null;

  return { experience, goal, accountSize, riskComfort, source };
}
