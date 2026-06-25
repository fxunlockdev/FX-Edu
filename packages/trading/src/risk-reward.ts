import { isPositiveFinite } from './math';
import type { RiskRewardInput, RiskRewardResult, Result } from './types';

/**
 * Reward-to-risk planning (PRD §8.7 Risk/Reward Planner).
 *
 * Risk and reward are measured as absolute price distances from entry; the
 * ratio is reward / risk. Pip conversion is instrument-independent here because
 * R:R is a pure ratio — we report raw price distances scaled into "pips" by the
 * caller's instrument elsewhere; this function reports the price-distance based
 * counts so it stays usable without an instrument lookup.
 *
 * The take-profit is validated to sit on the correct side of entry for the
 * direction (a long's target must be ABOVE entry; a short's BELOW), so a
 * mis-entered target is caught rather than silently producing a negative ratio.
 */
export function riskReward(input: RiskRewardInput): Result<RiskRewardResult> {
  const { entry, stopLoss, takeProfit, direction } = input;

  if (!isPositiveFinite(entry)) {
    return { ok: false, code: 'invalid_entry', message: 'Entry must be a positive number.' };
  }
  if (!isPositiveFinite(stopLoss)) {
    return { ok: false, code: 'invalid_stop', message: 'Stop loss must be a positive number.' };
  }
  if (!isPositiveFinite(takeProfit)) {
    return { ok: false, code: 'invalid_entry', message: 'Take profit must be a positive number.' };
  }
  if (stopLoss === entry) {
    return {
      ok: false,
      code: 'invalid_stop',
      message: 'Stop loss must differ from entry — a zero-distance stop has no risk.',
    };
  }

  // Stop must sit on the losing side of entry for the direction.
  const stopOnWrongSide =
    direction === 'long' ? stopLoss > entry : stopLoss < entry;
  if (stopOnWrongSide) {
    return {
      ok: false,
      code: 'invalid_stop',
      message:
        direction === 'long'
          ? 'For a long, the stop loss must be below entry.'
          : 'For a short, the stop loss must be above entry.',
    };
  }

  // Target must sit on the winning side of entry for the direction.
  const targetOnWrongSide =
    direction === 'long' ? takeProfit < entry : takeProfit > entry;
  if (targetOnWrongSide) {
    return {
      ok: false,
      code: 'invalid_entry',
      message:
        direction === 'long'
          ? 'For a long, the take profit must be above entry.'
          : 'For a short, the take profit must be below entry.',
    };
  }

  const stopPips = Math.abs(entry - stopLoss);
  const targetPips = Math.abs(takeProfit - entry);
  const rewardRisk = targetPips / stopPips;

  return { ok: true, value: { rewardRisk, stopPips, targetPips } };
}
