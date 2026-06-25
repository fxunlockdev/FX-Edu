/**
 * Shared numeric constants and risk thresholds.
 *
 * Centralized so the policy lives in one place and the UI and journal stay
 * numerically consistent with the calculator (PROJECT.md §8.7 acceptance:
 * calculations are deterministic and instrument-aware).
 */

/** Units of base asset in one standard FX lot. */
export const UNITS_PER_STANDARD_LOT = 100_000;

/**
 * $/pip for one standard lot of a USD-quoted FX pair (e.g. EUR/USD). This is
 * the same constant the existing client calculator uses, kept identical so the
 * server-side math agrees with the UI to the cent.
 */
export const PIP_VALUE_PER_STANDARD_LOT_USD = 10;

/** Risk-percent ceiling above which we warn (PRD §8.7: ">2% risk"). */
export const HIGH_RISK_PERCENT_THRESHOLD = 2;

/** Stop distance (pips) below which we warn the stop is dangerously tight. */
export const TIGHT_STOP_PIPS_THRESHOLD = 10;
