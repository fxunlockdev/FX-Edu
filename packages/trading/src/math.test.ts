import { describe, expect, it } from 'vitest';
import { lookupInstrument } from './instruments';
import {
  directionalMove,
  isPositiveFinite,
  pipsToPrice,
  priceToPips,
  roundTo,
} from './math';

const eur = lookupInstrument('EUR/USD');
const jpy = lookupInstrument('USD/JPY');

describe('isPositiveFinite', () => {
  it('accepts positive finite numbers only', () => {
    expect(isPositiveFinite(1)).toBe(true);
    expect(isPositiveFinite(0.0001)).toBe(true);
    expect(isPositiveFinite(0)).toBe(false);
    expect(isPositiveFinite(-1)).toBe(false);
    expect(isPositiveFinite(Number.NaN)).toBe(false);
    expect(isPositiveFinite(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe('priceToPips / pipsToPrice', () => {
  it('converts a major price distance to pips and back', () => {
    if (!eur.ok) throw new Error('fixture');
    expect(priceToPips(0.003, eur.value)).toBeCloseTo(30, 6);
    expect(pipsToPrice(30, eur.value)).toBeCloseTo(0.003, 8);
  });

  it('respects the 0.01 pip size for JPY', () => {
    if (!jpy.ok) throw new Error('fixture');
    expect(priceToPips(0.3, jpy.value)).toBeCloseTo(30, 6);
  });

  it('is always non-negative regardless of sign', () => {
    if (!eur.ok) throw new Error('fixture');
    expect(priceToPips(-0.003, eur.value)).toBeCloseTo(30, 6);
  });
});

describe('directionalMove', () => {
  it('is exit−entry for a long', () => {
    expect(directionalMove(1.1, 1.2, 'long')).toBeCloseTo(0.1, 8);
    expect(directionalMove(1.2, 1.1, 'long')).toBeCloseTo(-0.1, 8);
  });

  it('is entry−exit for a short', () => {
    expect(directionalMove(1.2, 1.1, 'short')).toBeCloseTo(0.1, 8);
    expect(directionalMove(1.1, 1.2, 'short')).toBeCloseTo(-0.1, 8);
  });
});

describe('roundTo', () => {
  it('rounds to the requested decimals without float drift', () => {
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(roundTo(33333.3333, 0)).toBe(33333);
    expect(roundTo(0.33333, 2)).toBe(0.33);
  });
});
