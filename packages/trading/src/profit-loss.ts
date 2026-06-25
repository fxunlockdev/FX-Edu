import { lookupInstrument } from './instruments.js';
import { directionalMove, isPositiveFinite } from './math.js';
import type { ProfitLossInput, Result } from './types.js';

/**
 * Profit & Loss simulation (PRD §8.7 Profit & Loss Simulator).
 *
 *   P&L = directionalMove(entry, exit, direction) × contractSize × lots
 *
 * where `directionalMove` is `exit − entry` for a long and `entry − exit` for a
 * short, so the SIGN of the result is the trade outcome: positive = profit,
 * negative = loss. The value is denominated in the instrument's quote currency
 * (USD for the registered instruments).
 *
 * Total and pure: unknown instrument and non-positive price/lots inputs return
 * typed error results instead of `NaN`.
 */
export function profitLoss(input: ProfitLossInput): Result<number> {
  const found = lookupInstrument(input.instrument);
  if (!found.ok) return found;
  const instrument = found.value;

  if (!isPositiveFinite(input.entry)) {
    return { ok: false, code: 'invalid_entry', message: 'Entry must be a positive number.' };
  }
  if (!isPositiveFinite(input.exit)) {
    return { ok: false, code: 'invalid_entry', message: 'Exit must be a positive number.' };
  }
  if (!isPositiveFinite(input.lots)) {
    return { ok: false, code: 'invalid_lots', message: 'Lot size must be a positive number.' };
  }

  const move = directionalMove(input.entry, input.exit, input.direction);
  const pnl = move * instrument.contractSize * input.lots;

  return { ok: true, value: pnl };
}
