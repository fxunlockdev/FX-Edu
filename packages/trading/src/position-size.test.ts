import { describe, expect, it } from 'vitest';
import { positionSize } from './position-size';
import type { PositionSizeInput } from './types';

/** EUR/USD with a 30-pip stop (1.1000 → 1.0970). */
function majorInput(overrides: Partial<PositionSizeInput> = {}): PositionSizeInput {
  return {
    accountBalance: 10_000,
    accountCurrency: 'USD',
    riskPercent: 1,
    instrument: 'EUR/USD',
    entry: 1.1,
    stopLoss: 1.097,
    ...overrides,
  };
}

describe('positionSize — design default example', () => {
  it('balance 10000, 1% risk, 30-pip stop on a major → $100, 0.33 lots, 33,333 units', () => {
    const result = positionSize(majorInput());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.riskAmount).toBeCloseTo(100, 10);
    expect(result.value.stopDistancePips).toBeCloseTo(30, 6);
    // 0.3333… lots; display rounds to 0.33.
    expect(result.value.lots).toBeCloseTo(0.33333333, 6);
    expect(Number(result.value.lots.toFixed(2))).toBe(0.33);
    // units = round(0.3333… × 100_000) = 33_333.
    expect(result.value.units).toBe(33_333);
    expect(result.value.warnings).toHaveLength(0);
  });
});

describe('positionSize — instrument awareness', () => {
  it('handles a JPY pair via the 0.01 pip size', () => {
    // 30-pip stop on USD/JPY = 0.30 price distance. $10/pip/lot model.
    const result = positionSize(
      majorInput({ instrument: 'USD/JPY', entry: 150, stopLoss: 149.7 }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.stopDistancePips).toBeCloseTo(30, 6);
    expect(result.value.lots).toBeCloseTo(0.33333333, 6);
  });

  it('sizes XAU/USD using its 100oz contract and 0.01 pip', () => {
    // $1/pip/lot for gold (0.01 × 100). 30-pip stop = $30 risk/lot.
    const result = positionSize(
      majorInput({ instrument: 'XAU/USD', entry: 2000, stopLoss: 1999.7 }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.stopDistancePips).toBeCloseTo(30, 6);
    // lots = 100 / (30 × 1) = 3.3333…
    expect(result.value.lots).toBeCloseTo(3.33333333, 6);
    expect(result.value.units).toBe(333); // round(3.3333 × 100)
  });

  it('sizes BTC/USD using pip 1 and contract 1', () => {
    // pipValuePerLot = 1. A 500-point stop risks $500/coin.
    const result = positionSize(
      majorInput({ instrument: 'BTC/USD', entry: 60_000, stopLoss: 59_500 }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.stopDistancePips).toBeCloseTo(500, 6);
    // lots = 100 / (500 × 1) = 0.2 coins
    expect(result.value.lots).toBeCloseTo(0.2, 8);
    expect(result.value.units).toBe(0); // round(0.2 × 1)
    expect(result.value.pipValue).toBeCloseTo(0.2, 8);
  });
});

describe('positionSize — risk inputs', () => {
  it('accepts an explicit riskAmount and derives implied percent', () => {
    const result = positionSize(
      majorInput({ riskPercent: undefined, riskAmount: 200 }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.riskAmount).toBe(200);
    // 200 / (30 × 10) = 0.6666… lots
    expect(result.value.lots).toBeCloseTo(0.66666667, 6);
    // 200/10000 = 2% — not > 2, so no high-risk warning.
    expect(result.value.warnings).toHaveLength(0);
  });

  it('riskAmount wins when both are supplied', () => {
    const result = positionSize(
      majorInput({ riskPercent: 1, riskAmount: 300 }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.riskAmount).toBe(300);
  });
});

describe('positionSize — warnings', () => {
  it('warns on risk > 2%', () => {
    const result = positionSize(majorInput({ riskPercent: 3 }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.warnings.map((w) => w.code)).toContain('high_risk');
  });

  it('warns on a tight stop (< 10 pips)', () => {
    // 5-pip stop.
    const result = positionSize(majorInput({ entry: 1.1, stopLoss: 1.0995 }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.stopDistancePips).toBeCloseTo(5, 6);
    expect(result.value.warnings.map((w) => w.code)).toContain('tight_stop');
  });

  it('does NOT warn at exactly 2% risk or exactly a 10-pip stop (boundaries)', () => {
    const result = positionSize(
      majorInput({ riskPercent: 2, entry: 1.1, stopLoss: 1.099 }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.stopDistancePips).toBeCloseTo(10, 6);
    expect(result.value.warnings).toHaveLength(0);
  });

  it('can raise both warnings at once', () => {
    const result = positionSize(
      majorInput({ riskPercent: 5, entry: 1.1, stopLoss: 1.0997 }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const codes = result.value.warnings.map((w) => w.code);
    expect(codes).toContain('high_risk');
    expect(codes).toContain('tight_stop');
  });
});

describe('positionSize — edge cases (total, no NaN)', () => {
  it('rejects an unknown instrument', () => {
    const result = positionSize(majorInput({ instrument: 'NOPE/USD' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('unknown_instrument');
  });

  it('rejects a zero-distance stop (stop === entry)', () => {
    const result = positionSize(majorInput({ stopLoss: 1.1 }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_stop');
  });

  it('rejects a non-positive stop', () => {
    expect(positionSize(majorInput({ stopLoss: 0 })).ok).toBe(false);
    expect(positionSize(majorInput({ stopLoss: -1 })).ok).toBe(false);
  });

  it('rejects a non-positive entry', () => {
    expect(positionSize(majorInput({ entry: 0 })).ok).toBe(false);
    expect(positionSize(majorInput({ entry: -1 })).ok).toBe(false);
  });

  it('rejects a non-positive balance', () => {
    const result = positionSize(majorInput({ accountBalance: 0 }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_balance');
  });

  it('rejects NaN / Infinity inputs', () => {
    expect(positionSize(majorInput({ accountBalance: Number.NaN })).ok).toBe(false);
    expect(positionSize(majorInput({ entry: Number.POSITIVE_INFINITY })).ok).toBe(false);
  });

  it('rejects when neither riskPercent nor riskAmount is supplied', () => {
    const result = positionSize(majorInput({ riskPercent: undefined }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('invalid_risk');
  });

  it('rejects a non-positive riskPercent and riskAmount', () => {
    expect(positionSize(majorInput({ riskPercent: 0 })).ok).toBe(false);
    expect(
      positionSize(majorInput({ riskPercent: undefined, riskAmount: -5 })).ok,
    ).toBe(false);
  });
});
