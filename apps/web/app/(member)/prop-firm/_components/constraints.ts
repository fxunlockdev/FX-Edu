/**
 * User-configurable prop-firm constraints (M13 / PROJECT.md §8.13).
 *
 * IMPORTANT: these are values the USER enters to model the firm they are
 * preparing for. They are NOT official figures pulled from any prop firm and
 * carry no guarantee — the UI states this plainly. The defaults below are a
 * common, illustrative starting point only.
 *
 * Persistence is `localStorage` for v1 (non-sensitive numeric settings). The
 * write path is isolated here so swapping to a Supabase-backed store later is a
 * one-file change. // TODO: persist to a `prop_firm_configs` table once the M13
 * write API lands (replace read/write below with the server client).
 */

/** The constraints a member configures for their target evaluation. */
export interface PropFirmConstraints {
  /** Max daily drawdown, percent of account balance. */
  readonly maxDailyDrawdown: number;
  /** Max overall (trailing) drawdown, percent of account balance. */
  readonly maxOverallDrawdown: number;
  /** Profit target to pass the evaluation, percent of account balance. */
  readonly profitTarget: number;
  /** Per-trade risk cap, percent of account balance. */
  readonly perTradeCap: number;
  /** Evaluation start date (ISO yyyy-mm-dd); empty when unset. */
  readonly startDate: string;
  /** Evaluation end date (ISO yyyy-mm-dd); empty when unset. */
  readonly endDate: string;
}

/** Illustrative defaults — NOT official firm data. */
export const DEFAULT_CONSTRAINTS: PropFirmConstraints = {
  maxDailyDrawdown: 5,
  maxOverallDrawdown: 10,
  profitTarget: 8,
  perTradeCap: 1,
  startDate: '',
  endDate: '',
};

// gitleaks:allow — localStorage key name, not a credential.
export const CONSTRAINTS_STORAGE_KEY = 'fx_prop_firm_constraints_v1';

/** Numeric fields, for validation/coercion. */
const NUMERIC_FIELDS = [
  'maxDailyDrawdown',
  'maxOverallDrawdown',
  'profitTarget',
  'perTradeCap',
] as const satisfies ReadonlyArray<keyof PropFirmConstraints>;

function coerceNumber(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function coerceDate(value: unknown): string {
  // Accept only yyyy-mm-dd; anything else degrades to unset.
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

/**
 * Normalize an untrusted partial (parsed JSON, query input) into a complete,
 * valid constraints object. Pure: never throws, always returns a full object.
 */
export function normalizeConstraints(input: unknown): PropFirmConstraints {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const next: Record<string, number | string> = {};
  for (const field of NUMERIC_FIELDS) {
    next[field] = coerceNumber(raw[field], DEFAULT_CONSTRAINTS[field]);
  }
  next.startDate = coerceDate(raw.startDate);
  next.endDate = coerceDate(raw.endDate);
  return next as unknown as PropFirmConstraints;
}

/** Read persisted constraints (client-only). Falls back to defaults. */
export function readConstraints(): PropFirmConstraints {
  if (typeof window === 'undefined') return DEFAULT_CONSTRAINTS;
  try {
    const raw = window.localStorage.getItem(CONSTRAINTS_STORAGE_KEY);
    if (!raw) return DEFAULT_CONSTRAINTS;
    return normalizeConstraints(JSON.parse(raw));
  } catch {
    return DEFAULT_CONSTRAINTS;
  }
}

/**
 * Persist constraints (client-only). v1 writes to `localStorage`; a stubbed
 * server write would slot in here behind the same call site.
 * // TODO: also write through to Supabase (`prop_firm_configs`) when wired.
 */
export function writeConstraints(constraints: PropFirmConstraints): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSTRAINTS_STORAGE_KEY, JSON.stringify(constraints));
  } catch {
    // Storage may be unavailable (private mode); config simply won't persist.
  }
}
