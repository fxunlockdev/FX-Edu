/**
 * Trade domain field model for the M5 Journal (PROJECT.md §8.8 / module 5).
 *
 * Single source of truth for the option sets, the snake_case column names that
 * match `packages/db/src/schema/journal.ts`, and the small label/format helpers
 * shared by the summary page, the Log Trade form, and the persistence layer.
 * Keeping this here (high cohesion) means the form, the table, and the DB write
 * can never drift on column names or enum values.
 *
 * Enum values mirror the Postgres enums exactly:
 *   trade_direction = long | short
 *   trade_result    = open | win | loss | breakeven
 *   trading_session = sydney | tokyo | london | new_york
 *   trade_status    = draft | logged
 */
import { allInstruments } from '@fxunlock/trading';

export type TradeDirection = 'long' | 'short';
export type TradeResult = 'open' | 'win' | 'loss' | 'breakeven';
export type TradingSession = 'sydney' | 'tokyo' | 'london' | 'new_york';
export type TradeStatus = 'draft' | 'logged';

export interface LabeledOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

/** Instruments offered in the journal — sourced from the trading registry so
 *  the dropdown and the math (position size / R-multiple) agree on symbols. */
export const INSTRUMENT_OPTIONS: ReadonlyArray<LabeledOption<string>> =
  allInstruments().map((i) => ({ value: i.symbol, label: i.symbol }));

export const DIRECTION_OPTIONS: ReadonlyArray<LabeledOption<TradeDirection>> = [
  { value: 'long', label: 'Long' },
  { value: 'short', label: 'Short' },
];

export const RESULT_OPTIONS: ReadonlyArray<LabeledOption<TradeResult>> = [
  { value: 'open', label: 'Open' },
  { value: 'win', label: 'Win' },
  { value: 'loss', label: 'Loss' },
  { value: 'breakeven', label: 'Breakeven' },
];

export const SESSION_OPTIONS: ReadonlyArray<LabeledOption<TradingSession>> = [
  { value: 'sydney', label: 'Sydney' },
  { value: 'tokyo', label: 'Tokyo' },
  { value: 'london', label: 'London' },
  { value: 'new_york', label: 'New York' },
];

/** Common setups. Free-text on the column (varchar 120) but offered as a
 *  curated list to keep journal analytics groupable. */
export const SETUP_OPTIONS: ReadonlyArray<LabeledOption<string>> = [
  { value: 'Breakout retest', label: 'Breakout retest' },
  { value: 'Liquidity sweep', label: 'Liquidity sweep' },
  { value: 'Trend continuation', label: 'Trend continuation' },
  { value: 'Trend pullback', label: 'Trend pullback' },
  { value: 'Range fade', label: 'Range fade' },
  { value: 'Support bounce', label: 'Support bounce' },
  { value: 'Failed breakout', label: 'Failed breakout' },
  { value: 'Session open', label: 'Session open' },
];

const DIRECTION_LABELS: Record<TradeDirection, string> = {
  long: 'Long',
  short: 'Short',
};
const RESULT_LABELS: Record<TradeResult, string> = {
  open: 'Open',
  win: 'Win',
  loss: 'Loss',
  breakeven: 'Breakeven',
};
const SESSION_LABELS: Record<TradingSession, string> = {
  sydney: 'Sydney',
  tokyo: 'Tokyo',
  london: 'London',
  new_york: 'New York',
};

export function directionLabel(v: string | null | undefined): string {
  return v && v in DIRECTION_LABELS ? DIRECTION_LABELS[v as TradeDirection] : '—';
}
export function resultLabel(v: string | null | undefined): string {
  return v && v in RESULT_LABELS ? RESULT_LABELS[v as TradeResult] : '—';
}
export function sessionLabel(v: string | null | undefined): string {
  return v && v in SESSION_LABELS ? SESSION_LABELS[v as TradingSession] : '—';
}

export function isTradeResult(v: string | null | undefined): v is TradeResult {
  return !!v && v in RESULT_LABELS;
}
export function isTradeDirection(v: string | null | undefined): v is TradeDirection {
  return !!v && v in DIRECTION_LABELS;
}
export function isTradingSession(v: string | null | undefined): v is TradingSession {
  return !!v && v in SESSION_LABELS;
}

/**
 * A trade row as the journal UI reads it (snake_case from the DB). Only the
 * columns the M5 screens actually use — the table has more (org_id, etc.).
 */
export interface TradeRow {
  readonly id: string;
  readonly instrument: string;
  readonly direction: string | null;
  readonly setup: string | null;
  readonly session: string | null;
  readonly entry: string | number | null;
  readonly stop_loss: string | number | null;
  readonly take_profit: string | number | null;
  readonly result: string | null;
  readonly r_multiple: string | number | null;
  readonly emotion: number | null;
  readonly status: string | null;
  readonly opened_at: string | null;
  readonly closed_at: string | null;
  readonly created_at: string | null;
}

/** Columns selected from `trades` for the journal screens. */
export const TRADE_SELECT_COLUMNS =
  'id, instrument, direction, setup, session, entry, stop_loss, take_profit, result, r_multiple, emotion, status, opened_at, closed_at, created_at';

/** Coerce a numeric-or-string DB value to a number (Postgres `numeric` comes
 *  back as a string via the REST API). Returns null when not parseable. */
export function toNumber(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Format an R-multiple for display, e.g. +2.1R / -1.0R / 0.0R. */
export function formatR(v: string | number | null | undefined): string {
  const n = toNumber(v);
  if (n === null) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}R`;
}
