import { describe, expect, it } from 'vitest';
import { lookupInstrument } from './instruments.js';
import { pipValue, pipValuePerLot } from './pip-value.js';

describe('pipValuePerLot', () => {
  it('is $10 for a standard lot of a USD-quoted major (0.0001 × 100k)', () => {
    const eur = lookupInstrument('EUR/USD');
    expect(eur.ok).toBe(true);
    if (eur.ok) expect(pipValuePerLot(eur.value)).toBeCloseTo(10, 10);
  });

  it('is 1000 (quote currency) for a JPY pair (0.01 × 100k)', () => {
    const jpy = lookupInstrument('USD/JPY');
    expect(jpy.ok).toBe(true);
    if (jpy.ok) expect(pipValuePerLot(jpy.value)).toBeCloseTo(1000, 6);
  });

  it('is $1 for a standard lot of gold (0.01 × 100)', () => {
    const xau = lookupInstrument('XAU/USD');
    expect(xau.ok).toBe(true);
    if (xau.ok) expect(pipValuePerLot(xau.value)).toBeCloseTo(1, 10);
  });

  it('is $1 for a unit of BTC (1 × 1)', () => {
    const btc = lookupInstrument('BTC/USD');
    expect(btc.ok).toBe(true);
    if (btc.ok) expect(pipValuePerLot(btc.value)).toBe(1);
  });
});

describe('pipValue', () => {
  it('scales by lots for a major', () => {
    const result = pipValue('EUR/USD', 0.5, 'USD');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(5, 10);
  });

  it('returns a typed error for an unknown instrument', () => {
    const result = pipValue('NOPE/USD', 1, 'USD');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('unknown_instrument');
  });

  it('rejects non-positive lots', () => {
    expect(pipValue('EUR/USD', 0, 'USD').ok).toBe(false);
    expect(pipValue('EUR/USD', -1, 'USD').ok).toBe(false);
    expect(pipValue('EUR/USD', Number.NaN, 'USD').ok).toBe(false);
  });

  it('rejects an empty account currency', () => {
    const result = pipValue('EUR/USD', 1, '  ');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_currency');
  });
});
