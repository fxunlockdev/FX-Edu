import { describe, expect, it } from 'vitest';
import { profitLoss } from './profit-loss';

describe('profitLoss — sign correctness', () => {
  it('long that moves up is a profit', () => {
    // EUR/USD, 1 lot (100k), +0.0010 move = +$100.
    const result = profitLoss({
      instrument: 'EUR/USD',
      direction: 'long',
      entry: 1.1,
      exit: 1.101,
      lots: 1,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(100, 8);
  });

  it('long that moves down is a loss', () => {
    const result = profitLoss({
      instrument: 'EUR/USD',
      direction: 'long',
      entry: 1.1,
      exit: 1.099,
      lots: 1,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(-100, 8);
  });

  it('short that moves down is a profit', () => {
    const result = profitLoss({
      instrument: 'EUR/USD',
      direction: 'short',
      entry: 1.1,
      exit: 1.099,
      lots: 1,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(100, 8);
  });

  it('short that moves up is a loss', () => {
    const result = profitLoss({
      instrument: 'EUR/USD',
      direction: 'short',
      entry: 1.1,
      exit: 1.101,
      lots: 1,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(-100, 8);
  });
});

describe('profitLoss — instrument awareness', () => {
  it('uses the metal contract size for gold', () => {
    // XAU/USD, 2 lots (200 oz), +$5 move = +$1000.
    const result = profitLoss({
      instrument: 'XAU/USD',
      direction: 'long',
      entry: 2000,
      exit: 2005,
      lots: 2,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(1000, 6);
  });

  it('uses unit contract for BTC', () => {
    // BTC/USD, 0.5 coin, +$1000 move = +$500.
    const result = profitLoss({
      instrument: 'BTC/USD',
      direction: 'long',
      entry: 60_000,
      exit: 61_000,
      lots: 0.5,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(500, 6);
  });
});

describe('profitLoss — edge cases', () => {
  it('rejects an unknown instrument', () => {
    const result = profitLoss({
      instrument: 'NOPE/USD',
      direction: 'long',
      entry: 1,
      exit: 2,
      lots: 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('unknown_instrument');
  });

  it('rejects non-positive prices and lots', () => {
    const base = { instrument: 'EUR/USD', direction: 'long' as const, entry: 1.1, exit: 1.2, lots: 1 };
    expect(profitLoss({ ...base, entry: 0 }).ok).toBe(false);
    expect(profitLoss({ ...base, exit: -1 }).ok).toBe(false);
    expect(profitLoss({ ...base, lots: 0 }).ok).toBe(false);
  });
});
