/**
 * Settings field model (PROJECT.md §9 module 17 / §8.16) — single source of
 * truth for the option sets and snake_case column names shared by the Settings
 * page (RSC read), the Profile/Preferences/Notification client leaves, and the
 * RLS-scoped writes. Keeping the option values here (high cohesion) means the
 * form, the labels, and the DB write can never drift.
 *
 * Risk-profile and default-session values mirror the trade-journal enums
 * (`trading_session`) and the onboarding risk-comfort keys so the calculator,
 * journal, and settings all agree.
 */

export interface LabeledOption {
  /** Stable machine value persisted to the DB. */
  readonly value: string;
  /** Human label shown in the UI. */
  readonly label: string;
}

/** ── Profile ────────────────────────────────────────────────────────────── */

/** A curated country list. Free-text would be valid too, but a select keeps the
 *  value clean and groupable. Values are ISO-3166 alpha-2 codes. */
export const COUNTRY_OPTIONS: ReadonlyArray<LabeledOption> = [
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'IE', label: 'Ireland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'PL', label: 'Poland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SG', label: 'Singapore' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'IN', label: 'India' },
] as const;

export const MAX_FULL_NAME = 80;
export const MAX_DISPLAY_NAME = 40;
export const MAX_BIO = 280;

/** ── Learning preferences ──────────────────────────────────────────────── */

/** Risk profile (drives example sizing). Values mirror the onboarding
 *  risk-comfort keys so the two never diverge. */
export const RISK_PROFILE_OPTIONS: ReadonlyArray<LabeledOption> = [
  { value: 'conservative', label: 'Conservative · 0.5% risk' },
  { value: 'balanced', label: 'Standard · 1% risk' },
  { value: 'aggressive', label: 'Defined · 2% risk' },
] as const;

/** Default session — mirrors the journal `trading_session` enum. */
export const DEFAULT_SESSION_OPTIONS: ReadonlyArray<LabeledOption> = [
  { value: 'london', label: 'London' },
  { value: 'new_york', label: 'New York' },
  { value: 'tokyo', label: 'Asia (Tokyo)' },
  { value: 'sydney', label: 'Sydney' },
] as const;

/** ── Notification preferences ──────────────────────────────────────────── */

/**
 * The five preference toggles, each backed by a snake_case boolean column on
 * `notification_preferences`. Defaults mirror the design prototype
 * (webinar/idea/community on; digest/product off).
 */
export interface NotificationPrefDef {
  readonly key: NotificationPrefKey;
  readonly column: string;
  readonly title: string;
  readonly hint: string;
  readonly defaultOn: boolean;
}

export type NotificationPrefKey =
  | 'webinarReminders'
  | 'tradeIdeas'
  | 'communityReplies'
  | 'weeklyDigest'
  | 'productUpdates';

export const NOTIFICATION_PREFS: ReadonlyArray<NotificationPrefDef> = [
  {
    key: 'webinarReminders',
    column: 'webinar_reminders',
    title: 'Live webinar reminders',
    hint: 'Get notified 30 minutes before sessions.',
    defaultOn: true,
  },
  {
    key: 'tradeIdeas',
    column: 'trade_ideas',
    title: 'New trade ideas',
    hint: 'When educators publish a new idea.',
    defaultOn: true,
  },
  {
    key: 'communityReplies',
    column: 'community_replies',
    title: 'Community replies',
    hint: 'When someone replies to your posts.',
    defaultOn: true,
  },
  {
    key: 'weeklyDigest',
    column: 'weekly_digest',
    title: 'Weekly progress digest',
    hint: 'A summary of your learning each week.',
    defaultOn: false,
  },
  {
    key: 'productUpdates',
    column: 'product_updates',
    title: 'Product updates',
    hint: 'New features and platform news.',
    defaultOn: false,
  },
] as const;

/** Preference state keyed by the camelCase key. */
export type NotificationPrefs = Record<NotificationPrefKey, boolean>;

/** Defaults applied when no row exists yet (or the table is not deployed). */
export function defaultNotificationPrefs(): NotificationPrefs {
  return Object.fromEntries(
    NOTIFICATION_PREFS.map((p): [NotificationPrefKey, boolean] => [p.key, p.defaultOn]),
  ) as NotificationPrefs;
}

const COUNTRY_VALUES = new Set(COUNTRY_OPTIONS.map((o) => o.value));
const RISK_PROFILE_VALUES = new Set(RISK_PROFILE_OPTIONS.map((o) => o.value));
const SESSION_VALUES = new Set(DEFAULT_SESSION_OPTIONS.map((o) => o.value));

export function isCountry(v: string | null | undefined): boolean {
  return !!v && COUNTRY_VALUES.has(v);
}
export function isRiskProfile(v: string | null | undefined): boolean {
  return !!v && RISK_PROFILE_VALUES.has(v);
}
export function isDefaultSession(v: string | null | undefined): boolean {
  return !!v && SESSION_VALUES.has(v);
}

/** Map the snake_case row from `notification_preferences` to the camelCase
 *  state, falling back to the per-pref default for any missing column. */
export function prefsFromRow(
  row: Record<string, unknown> | null | undefined,
): NotificationPrefs {
  if (!row) return defaultNotificationPrefs();
  return Object.fromEntries(
    NOTIFICATION_PREFS.map((p): [NotificationPrefKey, boolean] => {
      const raw = row[p.column];
      return [p.key, typeof raw === 'boolean' ? raw : p.defaultOn];
    }),
  ) as NotificationPrefs;
}

/** Map the camelCase state back to the snake_case columns for an upsert. */
export function prefsToRow(prefs: NotificationPrefs): Record<string, boolean> {
  return Object.fromEntries(
    NOTIFICATION_PREFS.map((p): [string, boolean] => [p.column, prefs[p.key]]),
  );
}
