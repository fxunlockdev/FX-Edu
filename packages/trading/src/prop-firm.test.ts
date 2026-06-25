import { describe, expect, it } from 'vitest';
import { propFirmCheck } from './prop-firm';
import type { PropFirmInput } from './types';

function input(overrides: Partial<PropFirmInput> = {}): PropFirmInput {
  return {
    riskPercent: 1,
    dailyLossUsed: 0,
    maxDailyDrawdown: 5,
    maxOverallDrawdown: 10,
    perTradeCap: 2,
    ...overrides,
  };
}

describe('propFirmCheck — all clear', () => {
  it('returns no violations for a compliant trade', () => {
    expect(propFirmCheck(input())).toHaveLength(0);
  });

  it('treats limits as inclusive (at-cap is allowed)', () => {
    // riskPercent === perTradeCap, dailyLossUsed + risk === maxDaily, overall === max.
    const result = propFirmCheck(
      input({ riskPercent: 2, dailyLossUsed: 3, maxDailyDrawdown: 5, maxOverallDrawdown: 2 }),
    );
    expect(result).toHaveLength(0);
  });
});

describe('propFirmCheck — violations', () => {
  it('flags a per-trade cap breach', () => {
    const result = propFirmCheck(input({ riskPercent: 3, perTradeCap: 2 }));
    expect(result.map((v) => v.code)).toContain('prop_cap_violation');
  });

  it('flags a daily drawdown breach', () => {
    const result = propFirmCheck(
      input({ riskPercent: 2, dailyLossUsed: 4, maxDailyDrawdown: 5, perTradeCap: 5 }),
    );
    expect(result.map((v) => v.code)).toContain('prop_daily_drawdown');
  });

  it('flags an overall drawdown breach', () => {
    const result = propFirmCheck(
      input({
        riskPercent: 2,
        overallLossUsed: 9,
        maxOverallDrawdown: 10,
        perTradeCap: 5,
        maxDailyDrawdown: 50,
      }),
    );
    expect(result.map((v) => v.code)).toContain('prop_overall_drawdown');
  });

  it('can flag multiple violations at once', () => {
    const result = propFirmCheck(
      input({
        riskPercent: 8,
        dailyLossUsed: 4,
        overallLossUsed: 9,
        maxDailyDrawdown: 5,
        maxOverallDrawdown: 10,
        perTradeCap: 2,
      }),
    );
    const codes = result.map((v) => v.code);
    expect(codes).toContain('prop_cap_violation');
    expect(codes).toContain('prop_daily_drawdown');
    expect(codes).toContain('prop_overall_drawdown');
    expect(result).toHaveLength(3);
  });

  it('defaults overallLossUsed to 0 when omitted', () => {
    const result = propFirmCheck(
      input({ riskPercent: 2, maxOverallDrawdown: 10, perTradeCap: 5 }),
    );
    expect(result.map((v) => v.code)).not.toContain('prop_overall_drawdown');
  });

  it('includes readable percentages in the message', () => {
    const result = propFirmCheck(input({ riskPercent: 2.5, perTradeCap: 2 }));
    const capViolation = result.find((v) => v.code === 'prop_cap_violation');
    expect(capViolation?.message).toContain('2.5%');
    expect(capViolation?.message).toContain('2%');
  });
});
