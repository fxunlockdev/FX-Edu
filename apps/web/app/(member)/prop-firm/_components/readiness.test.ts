import { describe, expect, it } from 'vitest';
import { computeReadiness, MIN_TRADES_FOR_SCORE } from './readiness';
import type { TradeRow } from '../../journal/trade-fields';

/**
 * Pure readiness-model tests (M13 / PROJECT.md §8.13). Mirrors the analytics +
 * trading-package test style: deterministic fixtures, no I/O, a fixed `now`, and
 * a small factory so each test states only the fields it cares about.
 *
 * The model must NEVER read as a guarantee: a perfect score is still framed as a
 * discipline read, so the tests assert score bounds and behavior, not promises.
 */
let seq = 0;
function trade(overrides: Partial<TradeRow> = {}): TradeRow {
  seq += 1;
  return {
    id: `t-${seq}`,
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

const NOW = Date.parse('2026-06-25T00:00:00Z');

describe('computeReadiness — empty / too-few', () => {
  it('returns the empty read for no trades', () => {
    const r = computeReadiness([], NOW);
    expect(r.empty).toBe(true);
    expect(r.score).toBe(0);
    expect(r.band).toBe('—');
    expect(r.signals).toHaveLength(0);
    expect(r.tradesConsidered).toBe(0);
  });

  it('stays empty below the minimum decided-trade threshold', () => {
    const rows = Array.from({ length: MIN_TRADES_FOR_SCORE - 1 }, () => trade());
    const r = computeReadiness(rows, NOW);
    expect(r.empty).toBe(true);
    expect(r.tradesConsidered).toBe(MIN_TRADES_FOR_SCORE - 1);
  });

  it('ignores open trades when counting decided trades for the threshold', () => {
    const rows = [
      ...Array.from({ length: 3 }, () => trade()),
      ...Array.from({ length: 5 }, () => trade({ result: 'open', r_multiple: null })),
    ];
    // Only 3 decided → still under the threshold despite 8 rows.
    expect(computeReadiness(rows, NOW).empty).toBe(true);
  });
});

describe('computeReadiness — scoring bounds', () => {
  it('keeps the score within 0–100 and sets a band once scored', () => {
    const rows = Array.from({ length: 6 }, () => trade());
    const r = computeReadiness(rows, NOW);
    expect(r.empty).toBe(false);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.band).not.toBe('—');
    expect(r.signals).toHaveLength(4);
  });

  it('weights of the four signals sum to 1', () => {
    const rows = Array.from({ length: 6 }, () => trade());
    const total = computeReadiness(rows, NOW).signals.reduce((s, x) => s + x.weight, 0);
    expect(total).toBeCloseTo(1, 9);
  });
});

describe('computeReadiness — risk discipline signal', () => {
  it('rewards losses kept within a 1R (≤1%) cap', () => {
    // 6 decided: disciplined losses (|R| <= 1) plus completeness everywhere.
    const rows = [
      trade({ result: 'loss', r_multiple: -1 }),
      trade({ result: 'loss', r_multiple: -0.8 }),
      trade({ result: 'win', r_multiple: 2 }),
      trade({ result: 'win', r_multiple: 1.5 }),
      trade({ result: 'win', r_multiple: 1 }),
      trade({ result: 'breakeven', r_multiple: 0 }),
    ];
    const risk = computeReadiness(rows, NOW).signals.find((s) => s.id === 'risk-discipline');
    expect(risk?.score).toBe(100); // 2 of 2 losses within the cap
  });

  it('penalizes losses that blew past the 1R cap', () => {
    const rows = [
      trade({ result: 'loss', r_multiple: -3 }), // blew the cap
      trade({ result: 'loss', r_multiple: -2.5 }), // blew the cap
      trade({ result: 'loss', r_multiple: -1 }), // within
      trade({ result: 'loss', r_multiple: -0.5 }), // within
      trade({ result: 'win', r_multiple: 2 }),
      trade({ result: 'win', r_multiple: 1 }),
    ];
    const risk = computeReadiness(rows, NOW).signals.find((s) => s.id === 'risk-discipline');
    expect(risk?.score).toBe(50); // 2 of 4 losses within the cap
  });
});

describe('computeReadiness — journaling consistency signal', () => {
  it('drops when outcomes/emotions are missing', () => {
    const complete = Array.from({ length: 6 }, () => trade());
    const sparse = Array.from({ length: 6 }, () =>
      trade({ result: 'win', emotion: null }),
    );
    const cScore = computeReadiness(complete, NOW).signals.find(
      (s) => s.id === 'journaling-consistency',
    )?.score;
    const sScore = computeReadiness(sparse, NOW).signals.find(
      (s) => s.id === 'journaling-consistency',
    )?.score;
    expect(cScore).toBeGreaterThan(sScore ?? 0);
  });
});

describe('computeReadiness — planning habit signal', () => {
  it('rewards trades carrying a setup and a target', () => {
    const planned = Array.from({ length: 6 }, () => trade()); // setup + take_profit set
    const unplanned = Array.from({ length: 6 }, () =>
      trade({ setup: null, take_profit: null }),
    );
    const pScore = computeReadiness(planned, NOW).signals.find(
      (s) => s.id === 'planning-habit',
    )?.score;
    const uScore = computeReadiness(unplanned, NOW).signals.find(
      (s) => s.id === 'planning-habit',
    )?.score;
    expect(pScore).toBe(100);
    expect(uScore).toBe(0);
  });
});

describe('computeReadiness — no-guarantee framing', () => {
  it('never describes the result as a guarantee or prediction', () => {
    const rows = Array.from({ length: 8 }, () => trade({ result: 'win', r_multiple: 2 }));
    const r = computeReadiness(rows, NOW);
    const text = [r.summary, ...r.signals.map((s) => s.detail)].join(' ').toLowerCase();
    expect(text).not.toMatch(/\b(guarantee|guaranteed|will pass|pass(ing)? guaranteed|ensure)\b/);
  });

  it('coerces numeric-string R values from the REST API', () => {
    const rows = [
      trade({ result: 'loss', r_multiple: '-0.9' }),
      trade({ result: 'loss', r_multiple: '-1.0' }),
      trade({ result: 'win', r_multiple: '2.0' }),
      trade({ result: 'win', r_multiple: '1.0' }),
      trade({ result: 'win', r_multiple: '1.5' }),
      trade({ result: 'breakeven', r_multiple: '0' }),
    ];
    const risk = computeReadiness(rows, NOW).signals.find((s) => s.id === 'risk-discipline');
    expect(risk?.score).toBe(100); // both string-R losses within the cap
  });
});
