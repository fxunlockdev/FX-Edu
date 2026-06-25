import { UNITS_PER_STANDARD_LOT } from './constants.js';
import type { Instrument, InstrumentClass, Result } from './types.js';

/**
 * The instrument model: pip size + contract size per class, with a typed
 * registry and a *total* lookup. An unknown instrument yields an explicit
 * error result — never `NaN`, never a thrown exception (PROJECT.md §8.7:
 * instrument-aware, deterministic).
 */

/** Per-class defaults. The registry below is built from these. */
interface ClassDefaults {
  readonly pipSize: number;
  readonly contractSize: number;
}

/**
 * Canonical pip size + contract size for each instrument class.
 *
 * - FX majors quote to 4 decimals → pip 0.0001; one standard lot is 100k units.
 * - JPY pairs quote to 2 decimals → pip 0.01; still 100k units per lot.
 * - Spot metals (XAU/USD) move in 0.01 increments; one lot is 100 troy ounces.
 * - Crypto (BTC/USD) we treat a "pip" as 1.0 of quote currency; one "lot" is a
 *   single coin so sizing is expressed directly in coins/units.
 */
export const CLASS_DEFAULTS: Readonly<Record<InstrumentClass, ClassDefaults>> = {
  fx_major: { pipSize: 0.0001, contractSize: UNITS_PER_STANDARD_LOT },
  fx_jpy: { pipSize: 0.01, contractSize: UNITS_PER_STANDARD_LOT },
  metal: { pipSize: 0.01, contractSize: 100 },
  crypto: { pipSize: 1, contractSize: 1 },
};

/** Build an {@link Instrument} from a symbol + class, applying class defaults. */
function defineInstrument(
  symbol: string,
  label: string,
  cls: InstrumentClass,
  baseCurrency: string,
  quoteCurrency: string,
): Instrument {
  const defaults = CLASS_DEFAULTS[cls];
  return Object.freeze({
    symbol,
    label,
    class: cls,
    pipSize: defaults.pipSize,
    contractSize: defaults.contractSize,
    baseCurrency,
    quoteCurrency,
  });
}

/**
 * The typed instrument registry. Keyed by normalized symbol. Covers one
 * representative of each modeled class plus the common USD-quoted majors the
 * calculator's default example uses (EUR/USD). Extend here as instruments are
 * added; the lookup stays total regardless.
 */
const REGISTRY: ReadonlyMap<string, Instrument> = new Map(
  (
    [
      // FX majors (USD-quoted, pip 0.0001).
      defineInstrument('EUR/USD', 'Euro / US Dollar', 'fx_major', 'EUR', 'USD'),
      defineInstrument('GBP/USD', 'British Pound / US Dollar', 'fx_major', 'GBP', 'USD'),
      defineInstrument('AUD/USD', 'Australian Dollar / US Dollar', 'fx_major', 'AUD', 'USD'),
      defineInstrument('NZD/USD', 'New Zealand Dollar / US Dollar', 'fx_major', 'NZD', 'USD'),
      // JPY pairs (pip 0.01).
      defineInstrument('USD/JPY', 'US Dollar / Japanese Yen', 'fx_jpy', 'USD', 'JPY'),
      defineInstrument('EUR/JPY', 'Euro / Japanese Yen', 'fx_jpy', 'EUR', 'JPY'),
      defineInstrument('GBP/JPY', 'British Pound / Japanese Yen', 'fx_jpy', 'GBP', 'JPY'),
      // Metals.
      defineInstrument('XAU/USD', 'Gold / US Dollar', 'metal', 'XAU', 'USD'),
      defineInstrument('XAG/USD', 'Silver / US Dollar', 'metal', 'XAG', 'USD'),
      // Crypto.
      defineInstrument('BTC/USD', 'Bitcoin / US Dollar', 'crypto', 'BTC', 'USD'),
      defineInstrument('ETH/USD', 'Ethereum / US Dollar', 'crypto', 'ETH', 'USD'),
    ] as const
  ).map((i) => [i.symbol, i] as const),
);

/**
 * Normalize a free-form instrument key to the registry's canonical form:
 * upper-cased, surrounding whitespace trimmed, and a missing slash inserted
 * for the common 6-letter FX shorthand (e.g. `eurusd` → `EUR/USD`).
 */
export function normalizeSymbol(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  if (trimmed.includes('/')) return trimmed;
  // Insert a slash for the canonical 6-letter FX form (EURUSD → EUR/USD).
  if (/^[A-Z]{6}$/.test(trimmed)) {
    return `${trimmed.slice(0, 3)}/${trimmed.slice(3)}`;
  }
  return trimmed;
}

/**
 * Total instrument lookup. Returns an `ok` result with the {@link Instrument},
 * or an `unknown_instrument` error — never throws, never returns `undefined`.
 */
export function lookupInstrument(symbol: string): Result<Instrument> {
  const normalized = normalizeSymbol(symbol);
  const found = REGISTRY.get(normalized);
  if (found === undefined) {
    return {
      ok: false,
      code: 'unknown_instrument',
      message: `Unknown instrument "${symbol}". Add it to the registry or check the symbol.`,
    };
  }
  return { ok: true, value: found };
}

/** Immutable list of every registered instrument (useful for UI dropdowns). */
export function allInstruments(): readonly Instrument[] {
  return Object.freeze([...REGISTRY.values()]);
}

/** Does the registry know this symbol? Convenience wrapper over the lookup. */
export function isKnownInstrument(symbol: string): boolean {
  return REGISTRY.has(normalizeSymbol(symbol));
}
