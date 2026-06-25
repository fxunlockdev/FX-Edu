/**
 * Core trading-math domain types.
 *
 * Everything here is plain, immutable data. The trading package is pure,
 * deterministic calculation with no I/O and no clock reads. Source of truth for
 * what these encode: PRD §8.7 (Trading Tools And Risk Calculator) and
 * PROJECT.md §8.7 / §4 (Trading Tools & Risk Calculator).
 */

/** Trade direction. `long` = buy, `short` = sell. */
export type Direction = 'long' | 'short';

/**
 * Instrument classes we model. Each class has a characteristic pip size and
 * standard contract size:
 *
 * - `fx_major`  — non-JPY FX pair, pip = 0.0001 (e.g. EUR/USD), 100k units/lot.
 * - `fx_jpy`    — JPY-quoted FX pair, pip = 0.01 (e.g. USD/JPY), 100k units/lot.
 * - `metal`     — spot metal, e.g. XAU/USD, pip = 0.01, 100 oz/lot.
 * - `crypto`    — crypto pair, e.g. BTC/USD, pip = 1, 1 unit/lot.
 */
export type InstrumentClass = 'fx_major' | 'fx_jpy' | 'metal' | 'crypto';

/**
 * A modeled instrument. Pure data — no live market price lives here. The pip
 * size and contract size are the deterministic constants every calculation
 * depends on; the optional quote/base currency lets a UI label and reason about
 * the pair without affecting the math (which assumes a USD-quoted instrument
 * for pip-value purposes; see {@link pipValue}).
 */
export interface Instrument {
  /** Stable lookup symbol, upper-case, e.g. `EUR/USD`, `USD/JPY`, `XAU/USD`. */
  readonly symbol: string;
  /** Display label for UI. */
  readonly label: string;
  /** Which class this instrument belongs to. */
  readonly class: InstrumentClass;
  /** Smallest tracked price increment for sizing (a "pip"). */
  readonly pipSize: number;
  /** Units of the base asset in one standard lot. */
  readonly contractSize: number;
  /** Quote currency (right side of the pair), upper-case. */
  readonly quoteCurrency: string;
  /** Base currency (left side of the pair), upper-case. */
  readonly baseCurrency: string;
}

/**
 * A typed failure result. The trading package never throws for *domain*
 * problems (unknown instrument, non-positive stop, etc.) — it returns a result
 * so callers must handle the failure explicitly. Programmer errors (passing the
 * wrong type entirely) are still caught by TypeScript.
 */
export interface TradingError {
  readonly ok: false;
  /** Machine-readable failure code. */
  readonly code: TradingErrorCode;
  /** Human-readable explanation safe to surface in a UI. */
  readonly message: string;
}

/** Machine-readable codes for every domain failure this package can return. */
export type TradingErrorCode =
  | 'unknown_instrument'
  | 'invalid_stop'
  | 'invalid_entry'
  | 'invalid_balance'
  | 'invalid_risk'
  | 'invalid_lots'
  | 'invalid_currency';

/** A successful result wrapping a value. */
export interface TradingOk<T> {
  readonly ok: true;
  readonly value: T;
}

/** Discriminated result type: success or a typed domain error. */
export type Result<T> = TradingOk<T> | TradingError;

/**
 * A non-blocking advisory attached to a calculation. Warnings never invalidate
 * a result — they flag risk the user should see before acting (PRD §8.7:
 * "Warnings for tight stops, >2% risk, prop firm cap violations").
 */
export interface Warning {
  /** Machine-readable warning code. */
  readonly code: WarningCode;
  /** Human-readable advisory safe to surface in a UI. */
  readonly message: string;
}

/** Machine-readable codes for every advisory this package can raise. */
export type WarningCode =
  | 'tight_stop'
  | 'high_risk'
  | 'prop_cap_violation'
  | 'prop_daily_drawdown'
  | 'prop_overall_drawdown';

/** Inputs to {@link positionSize}. Provide exactly one of risk% or risk amount. */
export interface PositionSizeInput {
  /** Account equity in the account currency. Must be > 0. */
  readonly accountBalance: number;
  /** ISO-ish account currency code, e.g. `USD`. */
  readonly accountCurrency: string;
  /** Risk as a percent of balance (e.g. 1 = 1%). Mutually exclusive with riskAmount. */
  readonly riskPercent?: number;
  /** Risk as an absolute amount in the account currency. Mutually exclusive with riskPercent. */
  readonly riskAmount?: number;
  /** Instrument symbol to size against (looked up in the registry). */
  readonly instrument: string;
  /** Planned entry price. Must be > 0. */
  readonly entry: number;
  /** Planned stop-loss price. Must be > 0 and != entry. */
  readonly stopLoss: number;
}

/** Output of {@link positionSize}. */
export interface PositionSizeResult {
  /** Suggested position size in standard lots (full precision). */
  readonly lots: number;
  /** Suggested position size in units of the base asset (rounded to whole units). */
  readonly units: number;
  /** Resolved risk amount in the account currency. */
  readonly riskAmount: number;
  /** Distance from entry to stop, in pips (always positive). */
  readonly stopDistancePips: number;
  /** Value of one pip for the suggested position, in the account currency. */
  readonly pipValue: number;
  /** Non-blocking advisories (tight stop, high risk). */
  readonly warnings: readonly Warning[];
}

/** Inputs to {@link riskReward}. */
export interface RiskRewardInput {
  /** Entry price. Must be > 0. */
  readonly entry: number;
  /** Stop-loss price. Must be > 0 and != entry. */
  readonly stopLoss: number;
  /** Take-profit price. Must be > 0. */
  readonly takeProfit: number;
  /** Trade direction. */
  readonly direction: Direction;
}

/** Output of {@link riskReward}. */
export interface RiskRewardResult {
  /** Reward-to-risk ratio (reward distance / risk distance). */
  readonly rewardRisk: number;
  /** Risk distance entry→stop, in pips (always positive). */
  readonly stopPips: number;
  /** Reward distance entry→target, in pips (always positive). */
  readonly targetPips: number;
}

/** Inputs to {@link profitLoss}. */
export interface ProfitLossInput {
  /** Instrument symbol (looked up in the registry). */
  readonly instrument: string;
  /** Trade direction. */
  readonly direction: Direction;
  /** Entry (fill) price. Must be > 0. */
  readonly entry: number;
  /** Exit price. Must be > 0. */
  readonly exit: number;
  /** Position size in standard lots. Must be > 0. */
  readonly lots: number;
}

/** Inputs to {@link rMultiple}. */
export interface RMultipleInput {
  /** Entry price. Must be > 0. */
  readonly entry: number;
  /** Stop-loss price (defines 1R). Must be > 0 and != entry. */
  readonly stopLoss: number;
  /** Realized exit price. Must be > 0. */
  readonly exit: number;
  /** Trade direction. */
  readonly direction: Direction;
}

/** Inputs to {@link propFirmCheck}. */
export interface PropFirmInput {
  /** Planned risk on this trade, as a percent of account balance. */
  readonly riskPercent: number;
  /** Loss already realized today, as a percent of account balance. */
  readonly dailyLossUsed: number;
  /** Max allowed daily drawdown, as a percent of account balance. */
  readonly maxDailyDrawdown: number;
  /** Max allowed overall drawdown, as a percent of account balance. */
  readonly maxOverallDrawdown: number;
  /** Per-trade risk cap, as a percent of account balance. */
  readonly perTradeCap: number;
  /** Overall drawdown already used, as a percent. Optional; defaults to 0. */
  readonly overallLossUsed?: number;
}
