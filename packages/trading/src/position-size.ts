import { lookupInstrument } from './instruments';
import { isPositiveFinite, priceToPips } from './math';
import { pipValuePerLot } from './pip-value';
import {
  collectWarnings,
  highRiskWarning,
  tightStopWarning,
} from './warnings';
import type {
  Instrument,
  PositionSizeInput,
  PositionSizeResult,
  Result,
} from './types';

/** Standard retail convention: one standard FX lot is $10 per pip for a USD
 *  account, regardless of pair (this is what the client `/tools` calculator does). */
const STD_FX_PIP_VALUE_USD_PER_LOT = 10;
const UNITS_PER_STANDARD_LOT = 100_000;

/**
 * Pip value per lot in the ACCOUNT currency (USD-account assumption).
 *
 * USD-quoted instruments (majors, metals, crypto) already report USD via
 * `pipValuePerLot`, so we use it directly. JPY-quoted pairs report JPY; an exact
 * figure needs a live quote→account FX rate (out of scope for this pure package),
 * so for sizing we apply the standard `$10/pip/standard-lot` FX convention the
 * client calculator uses. TODO(M4): accept a live rate for exact non-USD-quote sizing.
 */
function accountPipValuePerLot(instrument: Instrument): number {
  if (instrument.quoteCurrency === 'USD') {
    return pipValuePerLot(instrument);
  }
  return (
    STD_FX_PIP_VALUE_USD_PER_LOT *
    (instrument.contractSize / UNITS_PER_STANDARD_LOT)
  );
}

/**
 * Risk-first position sizing (PRD §8.7).
 *
 *   riskAmount       = balance × risk%        (or supplied directly)
 *   stopDistancePips = |entry − stopLoss| / pipSize
 *   pipValuePerLot   = pipSize × contractSize  (quote currency; USD-quoted here)
 *   lots             = riskAmount / (stopDistancePips × pipValuePerLot)
 *   units            = round(lots × contractSize)
 *
 * Verified against the design's default example: balance 10000, USD, 1% risk,
 * 30-pip stop on a major → riskAmount $100, 0.333… lots (0.33 when rounded for
 * display), 33,333 units. This matches the existing client calculator exactly.
 *
 * Total and pure: every failure (unknown instrument, non-positive stop/entry,
 * bad balance/risk) returns a typed error result instead of producing `NaN`.
 */
export function positionSize(input: PositionSizeInput): Result<PositionSizeResult> {
  const found = lookupInstrument(input.instrument);
  if (!found.ok) return found;
  const instrument = found.value;

  if (!isPositiveFinite(input.accountBalance)) {
    return {
      ok: false,
      code: 'invalid_balance',
      message: 'Account balance must be a positive number.',
    };
  }
  if (!isPositiveFinite(input.entry)) {
    return { ok: false, code: 'invalid_entry', message: 'Entry must be a positive number.' };
  }
  if (!isPositiveFinite(input.stopLoss)) {
    return { ok: false, code: 'invalid_stop', message: 'Stop loss must be a positive number.' };
  }
  if (input.stopLoss === input.entry) {
    return {
      ok: false,
      code: 'invalid_stop',
      message: 'Stop loss must differ from entry — a zero-distance stop has no risk.',
    };
  }

  const risk = resolveRiskAmount(input);
  if (!risk.ok) return risk;
  const { riskAmount, riskPercent } = risk.value;

  const stopDistancePips = priceToPips(input.entry - input.stopLoss, instrument);
  const valuePerLot = accountPipValuePerLot(instrument);
  // valuePerLot is > 0 for every registered instrument; stopDistancePips is > 0
  // because stopLoss != entry was validated above. So no division by zero.
  const lots = riskAmount / (stopDistancePips * valuePerLot);
  const units = Math.round(lots * instrument.contractSize);
  const pipValue = valuePerLot * lots;

  const warnings = collectWarnings([
    tightStopWarning(stopDistancePips),
    highRiskWarning(riskPercent),
  ]);

  return {
    ok: true,
    value: { lots, units, riskAmount, stopDistancePips, pipValue, warnings },
  };
}

/**
 * Resolve the dollar risk amount and the implied risk percent from the input.
 * Exactly one of `riskPercent` / `riskAmount` should be supplied; if both are
 * present `riskAmount` wins (it is the more explicit figure). The percent is
 * always derived so the high-risk warning fires consistently regardless of
 * which input path the caller used.
 */
function resolveRiskAmount(
  input: PositionSizeInput,
): Result<{ riskAmount: number; riskPercent: number }> {
  const { accountBalance, riskAmount, riskPercent } = input;

  if (riskAmount !== undefined) {
    if (!isPositiveFinite(riskAmount)) {
      return { ok: false, code: 'invalid_risk', message: 'Risk amount must be a positive number.' };
    }
    return {
      ok: true,
      value: { riskAmount, riskPercent: (riskAmount / accountBalance) * 100 },
    };
  }

  if (riskPercent !== undefined) {
    if (!isPositiveFinite(riskPercent)) {
      return { ok: false, code: 'invalid_risk', message: 'Risk percent must be a positive number.' };
    }
    return {
      ok: true,
      value: { riskAmount: (accountBalance * riskPercent) / 100, riskPercent },
    };
  }

  return {
    ok: false,
    code: 'invalid_risk',
    message: 'Provide either riskPercent or riskAmount.',
  };
}
