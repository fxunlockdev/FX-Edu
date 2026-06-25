import type { Direction, Warning } from '@fxunlock/trading';

/**
 * Form + derived-result types for the member Risk Calculator (M4 / PRD §8.7).
 * The form holds raw strings (what the user typed); the trading package owns all
 * numeric interpretation and validation.
 */

/** The four calculator modes shown as the pill toggle. */
export type CalcMode = 'position' | 'pip' | 'rr' | 'prop';

/** Which risk input the user last edited — the other is derived from it. */
export type RiskBasis = 'percent' | 'amount';

/** Raw form state. All numeric fields are strings (controlled inputs). */
export interface RiskForm {
  readonly accountBalance: string;
  readonly accountCurrency: string;
  readonly riskPercent: string;
  readonly riskAmount: string;
  /** Tracks which of risk %/amount drives the other. */
  readonly riskBasis: RiskBasis;
  readonly instrument: string;
  readonly direction: Direction;
  readonly entry: string;
  readonly stopLoss: string;
  readonly takeProfit: string;
  readonly mode: CalcMode;
  /** Prop-firm constraints (only used in `prop` mode). Percents of balance. */
  readonly propPerTradeCap: string;
  readonly propMaxDaily: string;
  readonly propMaxOverall: string;
  readonly propDailyUsed: string;
}

/** A computed output row (label + formatted value). */
export interface ResultRow {
  readonly label: string;
  readonly value: string;
  /** Render the value in the lime accent (used for the reward figure). */
  readonly accent?: boolean;
}

/** The fully-derived calculator result handed to the view. */
export interface RiskResult {
  /** Headline suggested position size, formatted (e.g. `0.33 lots`). */
  readonly headline: string;
  /** Caption under the headline (e.g. instrument + direction). */
  readonly headlineCaption: string;
  /** Output rows (risk amount, stop distance, reward, R:R, pip value). */
  readonly rows: readonly ResultRow[];
  /** Non-blocking advisories to surface (tight stop, >2% risk, prop caps). */
  readonly warnings: readonly Warning[];
  /** A blocking validation error to show below the inputs, if any. */
  readonly error: string | null;
}
