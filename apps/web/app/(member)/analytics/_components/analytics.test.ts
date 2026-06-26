import { describe, expect, it } from 'vitest';
import { analyze } from './analytics';
import type { TradeRow } from '../../journal/trade-fields';

/**
 * Pure analytics math tests (M6 / PROJECT.md §9 module 6). Mirrors the
 * trading-package test style: deterministic fixtures, no I/O, no clock reliance
 * (we pass a fixed `now`). Each row is built from a small factory so a test
 * only has to state the fields it cares about.
 */
function trade(overrides: Partial<TradeRow> = {}): TradeRow {
  return {
    id: cryptoId(),
    instrument: 'EUR/USD',
    direction: 'long',
    setup: 'Breakout retest',
    session: 'london',
    entry: 1.1,
    stop_loss: 1.097,
    take_profit: 1.106,
    result: 'win',
    r_multiple: 2,
    emotion: 6,
    status: 'logged',
    opened_at: '2026-06-01T08:00:00Z',
    closed_at: '2026-06-01T11:00:00Z',
    created_at: '2026-06-01T08:00:00Z',
    ...overrides,
  };
}

let seq = 0;
function cryptoId(): string {
  seq += 1;
  return `t-${seq}`;
}

const NOW = Date.parse('2026-06-25T00:00:00Z');

describe('analyze — empty input', () => {
  it('returns the empty view-model for no rows', () => {
    const a = analyze([], NOW);
    expect(a.empty).toBe(true);
    expect(a.summary.empty).toBe(true);
    expect(a.summary.winRate).toBe('—');
    expect(a.summary.netR).toBe('0.0R');
    expect(a.summary.tradesAnalyzed).toBe('0');
    expect(a.summary.consistencyGrade).toBe('—');
    expect(a.series.netROverTime).toHaveLength(0);
    expect(a.series.winRateBySession).toHaveLength(0);
    expect(a.insights).toHaveLength(0);
  });
});

describe('analyze — open-trade exclusion', () => {
  it('excludes open trades from all realized-R math', () => {
    const rows: TradeRow[] = [
      trade({ result: 'win', r_multiple: 2 }),
      trade({ result: 'open', r_multiple: null }),
      trade({ result: 'open', r_multiple: 5 }), // even a stray R must be ignored
    ];
    const a = analyze(rows, NOW);
    expect(a.summary.tradesAnalyzed).toBe('1');
    expect(a.summary.netR).toBe('+2.0R');
    expect(a.summary.winRate).toBe('100%');
  });

  it('drops rows with a null result too', () => {
    const a = analyze([trade({ result: null, r_multiple: 3 })], NOW);
    expect(a.empty).toBe(true);
    expect(a.summary.tradesAnalyzed).toBe('0');
  });
});

describe('analyze — win rate', () => {
  it('counts win/loss/breakeven as decided; rounds to a percent', () => {
    const rows: TradeRow[] = [
      trade({ result: 'win', r_multiple: 2 }),
      trade({ result: 'win', r_multiple: 1 }),
      trade({ result: 'loss', r_multiple: -1 }),
      trade({ result: 'breakeven', r_multiple: 0 }),
    ];
    // 2 wins / 4 decided = 50%
    expect(analyze(rows, NOW).summary.winRate).toBe('50%');
  });

  it('is "—" when no trades are decided', () => {
    // A closed trade with a non-decided result shouldn't exist in practice, but
    // guard anyway: zero decided → no denominator.
    const a = analyze([], NOW);
    expect(a.summary.winRate).toBe('—');
  });
});

describe('analyze — net R and avg R', () => {
  it('sums realized R for net, averages it for avg', () => {
    const rows: TradeRow[] = [
      trade({ result: 'win', r_multiple: 3 }),
      trade({ result: 'loss', r_multiple: -1 }),
      trade({ result: 'win', r_multiple: 2 }),
    ];
    const s = analyze(rows, NOW).summary;
    expect(s.netR).toBe('+4.0R'); // 3 - 1 + 2
    expect(s.avgR).toBe('+1.3R'); // 4 / 3 ≈ 1.33 → +1.3R
  });

  it('coerces numeric-string R values from the REST API', () => {
    const rows: TradeRow[] = [
      trade({ result: 'win', r_multiple: '2.5' }),
      trade({ result: 'loss', r_multiple: '-1.0' }),
    ];
    expect(analyze(rows, NOW).summary.netR).toBe('+1.5R');
  });
});

describe('analyze — net R over time series', () => {
  it('produces a chronological cumulative curve', () => {
    const rows: TradeRow[] = [
      trade({ closed_at: '2026-06-03T10:00:00Z', r_multiple: 2 }),
      trade({ closed_at: '2026-06-01T10:00:00Z', r_multiple: 1, result: 'win' }),
      trade({ closed_at: '2026-06-02T10:00:00Z', r_multiple: -1, result: 'loss' }),
    ];
    const series = analyze(rows, NOW).series.netROverTime;
    expect(series.map((p) => p.value)).toEqual([1, 0, 2]); // 1, 1-1, 0+2
    expect(series).toHaveLength(3);
  });
});

describe('analyze — by-session grouping', () => {
  it('computes win rate per session with readable labels', () => {
    const rows: TradeRow[] = [
      trade({ session: 'london', result: 'win', r_multiple: 1 }),
      trade({ session: 'london', result: 'loss', r_multiple: -1 }),
      trade({ session: 'tokyo', result: 'win', r_multiple: 2 }),
    ];
    const series = analyze(rows, NOW).series.winRateBySession;
    const london = series.find((p) => p.label === 'London');
    const tokyo = series.find((p) => p.label === 'Tokyo');
    expect(london?.value).toBe(50);
    expect(tokyo?.value).toBe(100);
  });
});

describe('analyze — by-setup grouping', () => {
  it('computes avg R per setup, best-first', () => {
    const rows: TradeRow[] = [
      trade({ setup: 'Breakout retest', result: 'win', r_multiple: 2 }),
      trade({ setup: 'Breakout retest', result: 'win', r_multiple: 1 }),
      trade({ setup: 'Range fade', result: 'loss', r_multiple: -1 }),
    ];
    const series = analyze(rows, NOW).series.avgRBySetup;
    expect(series[0]).toEqual({ label: 'Breakout retest', value: 1.5 });
    expect(series[1]).toEqual({ label: 'Range fade', value: -1 });
  });

  it('ignores trades with no setup tagged', () => {
    const rows: TradeRow[] = [
      trade({ setup: null, result: 'win', r_multiple: 2 }),
      trade({ setup: 'Range fade', result: 'win', r_multiple: 1 }),
    ];
    const series = analyze(rows, NOW).series.avgRBySetup;
    expect(series).toHaveLength(1);
    expect(series[0]?.label).toBe('Range fade');
  });
});

describe('analyze — by-pair grouping', () => {
  it('computes avg R per instrument', () => {
    const rows: TradeRow[] = [
      trade({ instrument: 'GBP/USD', result: 'win', r_multiple: 3 }),
      trade({ instrument: 'EUR/USD', result: 'loss', r_multiple: -1 }),
    ];
    const series = analyze(rows, NOW).series.avgRByPair;
    expect(series[0]).toEqual({ label: 'GBP/USD', value: 3 });
    expect(series[1]).toEqual({ label: 'EUR/USD', value: -1 });
  });
});

describe('analyze — consistency grade', () => {
  it('is "—" with fewer than 5 decided trades', () => {
    const rows: TradeRow[] = [trade(), trade(), trade()];
    expect(analyze(rows, NOW).summary.consistencyGrade).toBe('—');
  });

  it('awards a high grade for strong positive expectancy', () => {
    const rows: TradeRow[] = Array.from({ length: 6 }, () =>
      trade({ result: 'win', r_multiple: 2 }),
    );
    // 100% win rate, +2R avg → top bucket.
    expect(analyze(rows, NOW).summary.consistencyGrade).toBe('A+');
  });

  it('awards a low grade for negative expectancy', () => {
    const rows: TradeRow[] = Array.from({ length: 6 }, () =>
      trade({ result: 'loss', r_multiple: -1 }),
    );
    expect(analyze(rows, NOW).summary.consistencyGrade).toBe('D');
  });
});

describe('analyze — insights', () => {
  it('derives best session, best setup and a loss cluster, non-advisory', () => {
    const rows: TradeRow[] = [
      trade({ session: 'london', setup: 'Breakout retest', result: 'win', r_multiple: 2, closed_at: '2026-06-01T10:00:00Z' }), // Mon
      trade({ session: 'london', setup: 'Breakout retest', result: 'win', r_multiple: 2, closed_at: '2026-06-02T10:00:00Z' }), // Tue
      trade({ session: 'tokyo', setup: 'Range fade', result: 'loss', r_multiple: -1, closed_at: '2026-06-05T10:00:00Z' }), // Fri
    ];
    const insights = analyze(rows, NOW).insights;
    const ids = insights.map((i) => i.id);
    expect(ids).toContain('best-session');
    expect(ids).toContain('best-setup');
    expect(ids).toContain('loss-cluster');
    // Non-advisory: no insight should tell the user to take/avoid a trade.
    for (const i of insights) {
      expect(i.text.toLowerCase()).not.toMatch(/\b(buy|sell|should trade|recommend)\b/);
    }
  });
});
