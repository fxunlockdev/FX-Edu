import type { Direction } from '@fxunlock/trading';

/**
 * Save-to-journal handoff contract (M4 → M5).
 *
 * The Risk Calculator never persists anything itself — "Save to journal" is a
 * plain navigation to `/journal/new` carrying the planned trade as query
 * params. The journal module (M5 / PRD §8.8) reads these to pre-fill its
 * "Log a trade" form, so this shape is a stable interface between the two
 * modules. Keep the keys in sync on both sides.
 *
 * Only the user-entered *plan* travels in the URL — never a computed lot size
 * the journal would re-derive, and never anything sensitive. Numbers are passed
 * as the raw strings the user typed so the journal sees exactly what was on
 * screen (no rounding drift).
 */
export interface JournalDraft {
  /** Canonical instrument symbol, e.g. `EUR/USD`. */
  readonly instrument: string;
  /** Trade direction. */
  readonly direction: Direction;
  /** Planned entry price (as typed). */
  readonly entry: string;
  /** Planned stop-loss price (as typed). */
  readonly stopLoss: string;
  /** Planned take-profit price (as typed); empty when none set. */
  readonly takeProfit: string;
  /** Account balance used for sizing (as typed). */
  readonly accountBalance: string;
  /** Account currency code. */
  readonly accountCurrency: string;
  /** Risk percent of the account (as typed). */
  readonly riskPercent: string;
}

/** URL the journal reads its pre-fill from. */
export const JOURNAL_NEW_PATH = '/journal/new';

/**
 * Stable query-param keys the journal pre-fill reads. Centralized so both the
 * producer (this calculator) and the consumer (M5) reference one source of
 * truth instead of stringly-typed literals scattered across files.
 */
export const JOURNAL_PARAM = {
  instrument: 'instrument',
  direction: 'direction',
  entry: 'entry',
  stopLoss: 'sl',
  takeProfit: 'tp',
  accountBalance: 'balance',
  accountCurrency: 'currency',
  riskPercent: 'risk',
  /** Marks where the draft originated, so the journal can show provenance. */
  source: 'from',
} as const;

/**
 * Build the `/journal/new?…` href from a draft. Pure and total: empty/omitted
 * fields are simply left out of the query string. Uses `URLSearchParams` so
 * values are correctly percent-encoded (the `/` in `EUR/USD`, etc.).
 */
export function buildJournalHref(draft: JournalDraft): string {
  const params = new URLSearchParams();
  const set = (key: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed !== '') params.set(key, trimmed);
  };

  set(JOURNAL_PARAM.instrument, draft.instrument);
  set(JOURNAL_PARAM.direction, draft.direction);
  set(JOURNAL_PARAM.entry, draft.entry);
  set(JOURNAL_PARAM.stopLoss, draft.stopLoss);
  set(JOURNAL_PARAM.takeProfit, draft.takeProfit);
  set(JOURNAL_PARAM.accountBalance, draft.accountBalance);
  set(JOURNAL_PARAM.accountCurrency, draft.accountCurrency);
  set(JOURNAL_PARAM.riskPercent, draft.riskPercent);
  params.set(JOURNAL_PARAM.source, 'risk-calculator');

  return `${JOURNAL_NEW_PATH}?${params.toString()}`;
}
