/**
 * Derive a "sample trade" risk read from the user's journal for the live
 * `propFirmCheck` preview (M13 / PROJECT.md §8.13). Pure and total — no I/O.
 *
 * `propFirmCheck` wants the planned risk of a trade as a percent of balance. The
 * journal stores realized R-multiples, not a stored risk%, so we approximate the
 * trade's risk exposure from its realized loss: a loss of |R| on a 1%-risk plan
 * implies roughly |R|% of the account was at stake. This is an illustrative read
 * for the preview only, clearly framed as such in the UI — never a guarantee.
 */
import { toNumber, type TradeRow } from '../../journal/trade-fields';

export interface SampleTrade {
  /** Instrument symbol for the label, e.g. `EUR/USD`. */
  readonly instrument: string;
  /** Approximate risk exposure of the trade, as a percent of balance. */
  readonly riskPercent: number;
  /** Whether this came from a real logged trade vs. a neutral placeholder. */
  readonly fromJournal: boolean;
}

/** Neutral placeholder used when there is no usable trade to sample. */
export const PLACEHOLDER_SAMPLE: SampleTrade = {
  instrument: 'EUR/USD',
  riskPercent: 1,
  fromJournal: false,
};

/**
 * Pick the most-recent trade that carries a usable risk read and return it as a
 * sample. Falls back to a 1%-risk placeholder when none is found.
 *
 * @param rows Rows ordered most-recent-first (as the page queries them).
 */
export function deriveSampleTrade(rows: ReadonlyArray<TradeRow>): SampleTrade {
  for (const row of rows) {
    const r = toNumber(row.r_multiple);
    if (r !== null && row.result === 'loss') {
      // |R| of realized loss ≈ percent of account that was at risk on a 1R plan.
      const riskPercent = Math.min(Math.abs(r), 100);
      if (riskPercent > 0) {
        return { instrument: row.instrument, riskPercent, fromJournal: true };
      }
    }
  }
  return PLACEHOLDER_SAMPLE;
}
