import { lookupInstrument } from './instruments.js';
import type { Instrument, Result } from './types.js';

/**
 * Pip-value math.
 *
 * The value of one pip for a position is `pipSize × contractSize × lots`,
 * denominated in the instrument's QUOTE currency. For the USD-quoted
 * instruments this package models (EUR/USD, XAU/USD, BTC/USD, …) the quote
 * currency is USD, so when the account currency is USD this is the dollar value
 * per pip directly — matching the existing client calculator's $10/standard-lot
 * for a major (0.0001 × 100,000 = 10).
 *
 * Cross-currency conversion (e.g. a USD account trading USD/JPY, whose pip value
 * is in JPY) requires a live FX rate and is intentionally out of scope for this
 * pure package; callers that need it convert the quote-currency pip value with a
 * rate they supply. We surface the quote currency on the {@link Instrument} so
 * that boundary is explicit rather than silently wrong.
 */

/** Pip value for ONE standard lot of an instrument, in its quote currency. */
export function pipValuePerLot(instrument: Instrument): number {
  return instrument.pipSize * instrument.contractSize;
}

/**
 * Value of one pip for `lots` of an instrument, in the instrument's quote
 * currency. Total: an unknown instrument returns a typed error, and a
 * non-positive lot size returns an `invalid_lots` error rather than `NaN`/0
 * silently. `accountCurrency` is accepted for signature parity with the PRD
 * spec and to make the USD-quote assumption auditable at the call site.
 */
export function pipValue(
  instrumentSymbol: string,
  lots: number,
  accountCurrency: string,
): Result<number> {
  const found = lookupInstrument(instrumentSymbol);
  if (!found.ok) return found;

  if (!Number.isFinite(lots) || lots <= 0) {
    return {
      ok: false,
      code: 'invalid_lots',
      message: 'Lot size must be a positive number.',
    };
  }
  if (accountCurrency.trim() === '') {
    return {
      ok: false,
      code: 'invalid_currency',
      message: 'Account currency is required.',
    };
  }

  return { ok: true, value: pipValuePerLot(found.value) * lots };
}
