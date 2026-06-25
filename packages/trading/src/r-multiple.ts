import { directionalMove, isPositiveFinite } from './math';
import type { RMultipleInput, Result } from './types';

/**
 * R-multiple — the journal's core performance unit (PRD §8.8 / §4: R-multiple
 * recomputed server-side).
 *
 *   1R       = |entry − stopLoss|                 (the initial risk)
 *   realized = directionalMove(entry, exit, dir)  (signed outcome)
 *   R        = realized / 1R
 *
 * Sign correctness is the whole point:
 *  - A long that exits above entry → positive R; below entry → negative R.
 *  - A short that exits below entry → positive R; above entry → negative R.
 *  - Exit exactly at the stop → −1R; exit exactly at a 1R target → +1R.
 *
 * Instrument-independent: R is a ratio of price distances, so pip size cancels
 * out. Total and pure: non-positive prices or a zero-distance stop return a
 * typed error rather than dividing by zero.
 */
export function rMultiple(input: RMultipleInput): Result<number> {
  const { entry, stopLoss, exit, direction } = input;

  if (!isPositiveFinite(entry)) {
    return { ok: false, code: 'invalid_entry', message: 'Entry must be a positive number.' };
  }
  if (!isPositiveFinite(stopLoss)) {
    return { ok: false, code: 'invalid_stop', message: 'Stop loss must be a positive number.' };
  }
  if (!isPositiveFinite(exit)) {
    return { ok: false, code: 'invalid_entry', message: 'Exit must be a positive number.' };
  }
  if (stopLoss === entry) {
    return {
      ok: false,
      code: 'invalid_stop',
      message: 'Stop loss must differ from entry — 1R would be zero.',
    };
  }

  const initialRisk = Math.abs(entry - stopLoss);
  const realized = directionalMove(entry, exit, direction);

  return { ok: true, value: realized / initialRisk };
}
