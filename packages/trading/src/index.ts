/**
 * @fxunlock/trading — pure, deterministic forex/trading math.
 *
 * No I/O, no clock, no network, no mutation. This is the calculation foundation
 * shared by the Risk Calculator (M4 / PRD §8.7), the Journal R-multiple
 * (M5 / §8.8), and Performance Analytics (M6 / §8.9). Every function is total:
 * domain failures (unknown instrument, non-positive stop, …) return a typed
 * `Result` error instead of throwing or producing `NaN`. Numerically consistent
 * with the existing client `PositionSizeCalculator`.
 */

// Instrument model + registry.
export {
  CLASS_DEFAULTS,
  allInstruments,
  isKnownInstrument,
  lookupInstrument,
  normalizeSymbol,
} from './instruments';

// Constants (exported for callers that want to display thresholds in copy).
export {
  HIGH_RISK_PERCENT_THRESHOLD,
  PIP_VALUE_PER_STANDARD_LOT_USD,
  TIGHT_STOP_PIPS_THRESHOLD,
  UNITS_PER_STANDARD_LOT,
} from './constants';

// Calculators.
export { positionSize } from './position-size';
export { pipValue, pipValuePerLot } from './pip-value';
export { riskReward } from './risk-reward';
export { profitLoss } from './profit-loss';
export { rMultiple } from './r-multiple';
export { propFirmCheck } from './prop-firm';

// Warning builders (for callers composing their own advisories).
export {
  collectWarnings,
  highRiskWarning,
  tightStopWarning,
} from './warnings';

// Low-level math helpers (instrument-aware, reusable).
export {
  directionalMove,
  isPositiveFinite,
  pipsToPrice,
  priceToPips,
  roundTo,
} from './math';

// Types.
export type {
  Direction,
  Instrument,
  InstrumentClass,
  PositionSizeInput,
  PositionSizeResult,
  ProfitLossInput,
  PropFirmInput,
  Result,
  RiskRewardInput,
  RiskRewardResult,
  RMultipleInput,
  TradingError,
  TradingErrorCode,
  TradingOk,
  Warning,
  WarningCode,
} from './types';
