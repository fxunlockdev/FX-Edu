import type { Instrument, Result } from './types';

/**
 * Low-level, instrument-aware price math shared across the calculators. Pure
 * and total: validators return typed results instead of throwing, and the
 * distance/rounding helpers assume their inputs were already validated.
 */

/** Is the value a usable, finite, strictly-positive number? */
export function isPositiveFinite(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

/** Validate a price (entry/exit/target). Must be finite and > 0. */
export function requirePositivePrice(
  n: number,
  code: 'invalid_entry' | 'invalid_stop',
  label: string,
): Result<number> {
  if (!isPositiveFinite(n)) {
    return { ok: false, code, message: `${label} must be a positive number.` };
  }
  return { ok: true, value: n };
}

/**
 * Convert an absolute price distance into pips for an instrument. Always
 * returns a non-negative value (the absolute distance). Pip size is taken from
 * the instrument so JPY pairs (0.01) and majors (0.0001) are handled correctly.
 */
export function priceToPips(priceDistance: number, instrument: Instrument): number {
  return Math.abs(priceDistance) / instrument.pipSize;
}

/**
 * Convert a pip count back into an absolute price distance for an instrument.
 * Inverse of {@link priceToPips}.
 */
export function pipsToPrice(pips: number, instrument: Instrument): number {
  return pips * instrument.pipSize;
}

/**
 * Signed price move in the direction of the trade. For a long, price up is
 * positive; for a short, price down is positive. Used by P&L and R-multiple so
 * the *sign* reflects profit/loss, not just distance.
 */
export function directionalMove(
  entry: number,
  exit: number,
  direction: 'long' | 'short',
): number {
  return direction === 'long' ? exit - entry : entry - exit;
}

/**
 * Round to a fixed number of decimals without floating-point drift creeping in
 * (e.g. 0.1 + 0.2 artefacts). Deterministic and pure.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
