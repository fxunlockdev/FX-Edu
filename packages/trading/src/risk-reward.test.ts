import { describe, expect, it } from 'vitest';
import { riskReward } from './risk-reward';

describe('riskReward — ratio math', () => {
  it('computes 2:1 for a long with 20 risk / 40 reward', () => {
    const result = riskReward({
      entry: 1.1,
      stopLoss: 1.098, // 20 pips below
      takeProfit: 1.104, // 40 pips above
      direction: 'long',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.rewardRisk).toBeCloseTo(2, 6);
    expect(result.value.stopPips).toBeCloseTo(0.002, 8);
    expect(result.value.targetPips).toBeCloseTo(0.004, 8);
  });

  it('computes 3:1 for a short with symmetric distances', () => {
    const result = riskReward({
      entry: 1.2,
      stopLoss: 1.201, // 10 above (loss side for short)
      takeProfit: 1.197, // 30 below (win side for short)
      direction: 'short',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.rewardRisk).toBeCloseTo(3, 6);
  });
});

describe('riskReward — validation', () => {
  it('rejects a long stop placed above entry', () => {
    const result = riskReward({
      entry: 1.1,
      stopLoss: 1.102,
      takeProfit: 1.11,
      direction: 'long',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_stop');
  });

  it('rejects a short stop placed below entry', () => {
    const result = riskReward({
      entry: 1.1,
      stopLoss: 1.098,
      takeProfit: 1.09,
      direction: 'short',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_stop');
  });

  it('rejects a long target below entry', () => {
    const result = riskReward({
      entry: 1.1,
      stopLoss: 1.098,
      takeProfit: 1.099,
      direction: 'long',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_entry');
  });

  it('rejects a short target above entry', () => {
    const result = riskReward({
      entry: 1.1,
      stopLoss: 1.102,
      takeProfit: 1.101,
      direction: 'short',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_entry');
  });

  it('rejects a zero-distance stop', () => {
    const result = riskReward({
      entry: 1.1,
      stopLoss: 1.1,
      takeProfit: 1.2,
      direction: 'long',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_stop');
  });

  it('rejects non-positive prices', () => {
    expect(
      riskReward({ entry: 0, stopLoss: 1, takeProfit: 2, direction: 'long' }).ok,
    ).toBe(false);
    expect(
      riskReward({ entry: 1, stopLoss: -1, takeProfit: 2, direction: 'long' }).ok,
    ).toBe(false);
    expect(
      riskReward({ entry: 1, stopLoss: 0.5, takeProfit: 0, direction: 'long' }).ok,
    ).toBe(false);
  });
});
