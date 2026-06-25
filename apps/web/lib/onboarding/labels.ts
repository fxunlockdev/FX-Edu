import {
  ACCOUNT_SIZE_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  RISK_COMFORT_OPTIONS,
  SOURCE_OPTIONS,
  type ProfileOption,
} from './profile-fields';

function lookup(options: ReadonlyArray<ProfileOption>, value: string | null | undefined): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? null;
}

/** Maps a stored trading-profile field value back to its display label. */
export const profileLabel = {
  experience: (v: string | null | undefined) => lookup(EXPERIENCE_OPTIONS, v),
  goal: (v: string | null | undefined) => lookup(GOAL_OPTIONS, v),
  accountSize: (v: string | null | undefined) => lookup(ACCOUNT_SIZE_OPTIONS, v),
  riskComfort: (v: string | null | undefined) => lookup(RISK_COMFORT_OPTIONS, v),
  source: (v: string | null | undefined) => lookup(SOURCE_OPTIONS, v),
} as const;
