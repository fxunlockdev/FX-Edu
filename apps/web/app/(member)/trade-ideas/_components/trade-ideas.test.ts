import { describe, expect, it } from 'vitest';
import {
  deriveFacets,
  filterIdeas,
  firstParam,
  isLocked,
  resolveFilterState,
  resolvePlan,
  timeSince,
  type Plan,
} from './ideas-types';
import { TRADE_IDEAS } from './ideas-data';
import { NEWS_FEED, PRICE_BOARD } from './market-data';

/**
 * Trade Ideas pure-logic tests (M11 / PROJECT.md §11). Deterministic, no I/O.
 * The plan/lock logic is the security-relevant surface — the UI must never grant
 * access it cannot prove, so the defensive default + lock rules are the priority
 * (real enforcement is server-side; this guards the hint).
 */

describe('resolvePlan — defensive default', () => {
  it('defaults to basic when nothing is provided', () => {
    expect(resolvePlan()).toBe('basic');
  });

  it('defaults to basic for unknown / malformed input', () => {
    expect(resolvePlan(null)).toBe('basic');
    expect(resolvePlan('')).toBe('basic');
    expect(resolvePlan('PRO')).toBe('basic');
    expect(resolvePlan('enterprise')).toBe('basic');
  });

  it('passes through recognized paid plans', () => {
    expect(resolvePlan('pro')).toBe('pro');
    expect(resolvePlan('elite')).toBe('elite');
    expect(resolvePlan('basic')).toBe('basic');
  });
});

describe('isLocked — Pro gating', () => {
  it('locks the feed for Basic only', () => {
    expect(isLocked('basic')).toBe(true);
    (['pro', 'elite'] satisfies Plan[]).forEach((plan) => {
      expect(isLocked(plan)).toBe(false);
    });
  });
});

describe('firstParam', () => {
  it('returns the value for a string', () => {
    expect(firstParam('eur')).toBe('eur');
  });
  it('returns the first element of an array', () => {
    expect(firstParam(['eur', 'gbp'])).toBe('eur');
  });
  it('returns undefined when absent', () => {
    expect(firstParam(undefined)).toBeUndefined();
  });
});

describe('deriveFacets', () => {
  const facets = deriveFacets(TRADE_IDEAS);

  it('derives distinct, sorted instruments', () => {
    expect(facets.instruments.length).toBeGreaterThan(0);
    expect(new Set(facets.instruments).size).toBe(facets.instruments.length);
    const sorted = [...facets.instruments].sort((a, b) => a.localeCompare(b));
    expect(facets.instruments).toEqual(sorted);
  });

  it('derives every facet axis', () => {
    expect(facets.timeframes.length).toBeGreaterThan(0);
    expect(facets.educators.length).toBeGreaterThan(0);
    expect(facets.tags.length).toBeGreaterThan(0);
  });
});

describe('resolveFilterState — URL params', () => {
  const facets = deriveFacets(TRADE_IDEAS);

  it('returns all-null for empty params', () => {
    const state = resolveFilterState({}, facets);
    expect(state).toEqual({ instrument: null, timeframe: null, educator: null, tag: null });
  });

  it('ignores values that are not real facets (hand-edited query)', () => {
    const state = resolveFilterState({ instrument: 'FAKE/PAIR', educator: 'Nobody' }, facets);
    expect(state.instrument).toBeNull();
    expect(state.educator).toBeNull();
  });

  it('accepts valid facet values', () => {
    const instrument = facets.instruments[0];
    const educator = facets.educators[0];
    const state = resolveFilterState({ instrument, educator }, facets);
    expect(state.instrument).toBe(instrument);
    expect(state.educator).toBe(educator);
  });
});

describe('filterIdeas', () => {
  it('returns the full list when no filters are active', () => {
    const all = filterIdeas(TRADE_IDEAS, {
      instrument: null,
      timeframe: null,
      educator: null,
      tag: null,
    });
    expect(all).toHaveLength(TRADE_IDEAS.length);
  });

  it('narrows by a single facet', () => {
    const instrument = TRADE_IDEAS[0]!.instrument;
    const result = filterIdeas(TRADE_IDEAS, {
      instrument,
      timeframe: null,
      educator: null,
      tag: null,
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((i) => i.instrument === instrument)).toBe(true);
  });

  it('combines facets with AND semantics', () => {
    const seed = TRADE_IDEAS[0]!;
    const result = filterIdeas(TRADE_IDEAS, {
      instrument: seed.instrument,
      timeframe: seed.timeframe,
      educator: seed.educator,
      tag: seed.tag,
    });
    expect(result.every((i) => i.educator === seed.educator)).toBe(true);
  });

  it('can return an empty result without throwing', () => {
    const result = filterIdeas(TRADE_IDEAS, {
      instrument: TRADE_IDEAS[0]!.instrument,
      timeframe: null,
      educator: 'Nonexistent Educator',
      tag: null,
    });
    expect(result).toHaveLength(0);
  });
});

describe('timeSince', () => {
  const now = new Date('2026-06-26T10:00:00.000Z');

  it('formats minutes, hours and days', () => {
    expect(timeSince('2026-06-26T09:30:00.000Z', now)).toBe('30m ago');
    expect(timeSince('2026-06-26T07:00:00.000Z', now)).toBe('3h ago');
    expect(timeSince('2026-06-24T10:00:00.000Z', now)).toBe('2d ago');
  });

  it('handles the just-now boundary', () => {
    expect(timeSince('2026-06-26T09:59:40.000Z', now)).toBe('just now');
  });

  it('degrades to empty string on an unparseable date', () => {
    expect(timeSince('not-a-date', now)).toBe('');
  });
});

describe('idea dataset integrity — educational framing', () => {
  it('ships the six PRD §11 instruments coverage', () => {
    expect(TRADE_IDEAS.length).toBeGreaterThanOrEqual(6);
  });

  it('has unique ids', () => {
    const ids = TRADE_IDEAS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every idea the educational teaching fields (no order ticket)', () => {
    for (const idea of TRADE_IDEAS) {
      expect(idea.note.length).toBeGreaterThan(0);
      expect(idea.entryArea.length).toBeGreaterThan(0);
      expect(idea.invalidation.length).toBeGreaterThan(0);
      expect(idea.objective.length).toBeGreaterThan(0);
      expect(idea.related.href.startsWith('/')).toBe(true);
    }
  });

  it('uses only educational bias views, never directives', () => {
    const allowed = new Set(['long', 'short', 'neutral']);
    for (const idea of TRADE_IDEAS) {
      expect(allowed.has(idea.bias)).toBe(true);
    }
  });
});

describe('stubbed market data — degrades honestly', () => {
  it('marks the news feed as not-yet-live (provider unwired)', () => {
    expect(NEWS_FEED.available).toBe(false);
  });

  it('marks the price board as not-yet-live and labels it non-execution-grade', () => {
    expect(PRICE_BOARD.available).toBe(false);
    expect(PRICE_BOARD.statusLabel.length).toBeGreaterThan(0);
  });

  it('normalizes every price sparkline series into 0–1', () => {
    for (const quote of PRICE_BOARD.quotes) {
      expect(quote.series.length).toBeGreaterThanOrEqual(2);
      expect(Math.min(...quote.series)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...quote.series)).toBeLessThanOrEqual(1);
    }
  });
});
