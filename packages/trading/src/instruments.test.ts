import { describe, expect, it } from 'vitest';
import {
  CLASS_DEFAULTS,
  allInstruments,
  isKnownInstrument,
  lookupInstrument,
  normalizeSymbol,
} from './instruments';

describe('CLASS_DEFAULTS', () => {
  it('uses pip 0.0001 and 100k contract for FX majors', () => {
    expect(CLASS_DEFAULTS.fx_major).toEqual({ pipSize: 0.0001, contractSize: 100_000 });
  });

  it('uses pip 0.01 and 100k contract for JPY pairs', () => {
    expect(CLASS_DEFAULTS.fx_jpy).toEqual({ pipSize: 0.01, contractSize: 100_000 });
  });

  it('uses pip 0.01 and 100oz contract for metals', () => {
    expect(CLASS_DEFAULTS.metal).toEqual({ pipSize: 0.01, contractSize: 100 });
  });

  it('uses pip 1 and unit contract for crypto', () => {
    expect(CLASS_DEFAULTS.crypto).toEqual({ pipSize: 1, contractSize: 1 });
  });
});

describe('normalizeSymbol', () => {
  it('upper-cases and trims', () => {
    expect(normalizeSymbol('  eur/usd ')).toBe('EUR/USD');
  });

  it('inserts a slash into 6-letter FX shorthand', () => {
    expect(normalizeSymbol('eurusd')).toBe('EUR/USD');
    expect(normalizeSymbol('usdjpy')).toBe('USD/JPY');
  });

  it('leaves non-6-letter symbols without a slash untouched (besides case)', () => {
    expect(normalizeSymbol('xau/usd')).toBe('XAU/USD');
    expect(normalizeSymbol('btc')).toBe('BTC');
  });
});

describe('lookupInstrument', () => {
  it('resolves a known FX major', () => {
    const result = lookupInstrument('EUR/USD');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.class).toBe('fx_major');
      expect(result.value.pipSize).toBe(0.0001);
      expect(result.value.contractSize).toBe(100_000);
      expect(result.value.quoteCurrency).toBe('USD');
    }
  });

  it('resolves a JPY pair with the 0.01 pip size', () => {
    const result = lookupInstrument('USD/JPY');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.class).toBe('fx_jpy');
      expect(result.value.pipSize).toBe(0.01);
    }
  });

  it('resolves a metal (XAU/USD) with a 100oz contract', () => {
    const result = lookupInstrument('XAU/USD');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.class).toBe('metal');
      expect(result.value.contractSize).toBe(100);
    }
  });

  it('resolves crypto (BTC/USD) with pip 1 and contract 1', () => {
    const result = lookupInstrument('BTC/USD');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.class).toBe('crypto');
      expect(result.value.pipSize).toBe(1);
      expect(result.value.contractSize).toBe(1);
    }
  });

  it('resolves shorthand input via normalization', () => {
    const result = lookupInstrument('eurusd');
    expect(result.ok).toBe(true);
  });

  it('returns a typed error for an unknown instrument (never throws, never NaN)', () => {
    const result = lookupInstrument('DOGE/MARS');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('unknown_instrument');
      expect(result.message).toContain('DOGE/MARS');
    }
  });
});

describe('isKnownInstrument', () => {
  it('is true for registered, false for unknown', () => {
    expect(isKnownInstrument('EUR/USD')).toBe(true);
    expect(isKnownInstrument('eurusd')).toBe(true);
    expect(isKnownInstrument('NOPE/USD')).toBe(false);
  });
});

describe('allInstruments', () => {
  it('returns a non-empty immutable list covering every class', () => {
    const list = allInstruments();
    expect(list.length).toBeGreaterThan(0);
    const classes = new Set(list.map((i) => i.class));
    expect(classes).toEqual(new Set(['fx_major', 'fx_jpy', 'metal', 'crypto']));
  });
});
