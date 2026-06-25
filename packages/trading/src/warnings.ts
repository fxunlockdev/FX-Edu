import {
  HIGH_RISK_PERCENT_THRESHOLD,
  TIGHT_STOP_PIPS_THRESHOLD,
} from './constants.js';
import type { Warning } from './types.js';

/**
 * Advisory builders. Warnings are non-blocking risk flags (PRD §8.7) — they are
 * appended to an otherwise-valid result so the UI can surface them before save.
 * Each builder is pure and returns `null` when the condition does not apply, so
 * callers can `filter(Boolean)` a list of candidates.
 */

/** Warn when the stop is dangerously tight (< {@link TIGHT_STOP_PIPS_THRESHOLD} pips). */
export function tightStopWarning(stopDistancePips: number): Warning | null {
  if (stopDistancePips > 0 && stopDistancePips < TIGHT_STOP_PIPS_THRESHOLD) {
    return {
      code: 'tight_stop',
      message:
        'A very tight stop magnifies size: slippage or spread can blow past it before your plan plays out.',
    };
  }
  return null;
}

/** Warn when planned risk exceeds the prudent {@link HIGH_RISK_PERCENT_THRESHOLD}% ceiling. */
export function highRiskWarning(riskPercent: number): Warning | null {
  if (riskPercent > HIGH_RISK_PERCENT_THRESHOLD) {
    return {
      code: 'high_risk',
      message:
        'Risking more than 2% per trade is aggressive — a short losing streak can erode your account fast.',
    };
  }
  return null;
}

/** Collapse a list of optional warnings into an immutable, defined-only array. */
export function collectWarnings(
  candidates: readonly (Warning | null)[],
): readonly Warning[] {
  return Object.freeze(candidates.filter((w): w is Warning => w !== null));
}
