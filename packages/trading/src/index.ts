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
} from './instruments.js';

// Constants (exported for callers that want to display thresholds in copy).
export {
  HIGH_RISK_PERCENT_THRESHOLD,
  PIP_VALUE_PER_STANDARD_LOT_USD,
  TIGHT_STOP_PIPS_THRESHOLD,
  UNITS_PER_STANDARD_LOT,
} from './constants.js';

// Calculators.
export { positionSize } from './position-size.js';
export { pipValue, pipValuePerLot } from './pip-value.js';
export { riskReward } from './risk-reward.js';
export { profitLoss } from './profit-loss.js';
export { rMultiple } from './r-multiple.js';
export { propFirmCheck } from './prop-firm.js';

// Warning builders (for callers composing their own advisories).
export {
  collectWarnings,
  highRiskWarning,
  tightStopWarning,
} from './warnings.js';

// Low-level math helpers (instrument-aware, reusable).
export {
  directionalMove,
  isPositiveFinite,
  pipsToPrice,
  priceToPips,
  roundTo,
} from './math.js';

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
} from './types.js';
