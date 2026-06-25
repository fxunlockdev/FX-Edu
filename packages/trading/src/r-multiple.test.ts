import { describe, expect, it } from 'vitest';
import { rMultiple } from './r-multiple';

describe('rMultiple — long sign correctness', () => {
  const base = { entry: 1.1, stopLoss: 1.09, direction: 'long' as const }; // 1R = 0.01

  it('exit at a 2R target → +2R', () => {
    const result = rMultiple({ ...base, exit: 1.12 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(2, 8);
  });

  it('exit exactly at the stop → −1R', () => {
    const result = rMultiple({ ...base, exit: 1.09 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(-1, 8);
  });

  it('exit at entry → 0R (breakeven)', () => {
    const result = rMultiple({ ...base, exit: 1.1 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(0, 8);
  });

  it('exit beyond the stop → worse than −1R', () => {
    const result = rMultiple({ ...base, exit: 1.085 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(-1.5, 8);
  });
});

describe('rMultiple — short sign correctness', () => {
  const base = { entry: 1.1, stopLoss: 1.11, direction: 'short' as const }; // 1R = 0.01

  it('exit below entry (winning side) → positive R', () => {
    const result = rMultiple({ ...base, exit: 1.08 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(2, 8);
  });

  it('exit at the stop (above entry) → −1R', () => {
    const result = rMultiple({ ...base, exit: 1.11 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(-1, 8);
  });

  it('exit above entry → negative R', () => {
    const result = rMultiple({ ...base, exit: 1.105 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(-0.5, 8);
  });
});

describe('rMultiple — instrument independence', () => {
  it('a JPY-scale trade yields the same R as a major with proportional distances', () => {
    // entry 150, stop 149, 1R = 1.0; exit 152 → +2R.
    const result = rMultiple({ entry: 150, stopLoss: 149, exit: 152, direction: 'long' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBeCloseTo(2, 8);
  });
});

describe('rMultiple — edge cases', () => {
  it('rejects a zero-distance stop', () => {
    const result = rMultiple({ entry: 1.1, stopLoss: 1.1, exit: 1.2, direction: 'long' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_stop');
  });

  it('rejects non-positive prices', () => {
    expect(rMultiple({ entry: 0, stopLoss: 1, exit: 2, direction: 'long' }).ok).toBe(false);
    expect(rMultiple({ entry: 1, stopLoss: -1, exit: 2, direction: 'long' }).ok).toBe(false);
    expect(rMultiple({ entry: 1, stopLoss: 0.5, exit: 0, direction: 'long' }).ok).toBe(false);
  });
});
