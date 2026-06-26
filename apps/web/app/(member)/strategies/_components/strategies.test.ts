import { describe, expect, it } from 'vitest';
import {
  filterByCategory,
  isLocked,
  resolveCategory,
  resolvePlan,
  type Plan,
} from './strategies-types';
import { STRATEGIES, allStrategySlugs, getStrategyBySlug } from './strategies-data';

/**
 * Strategy Library pure-logic tests (M10 / PROJECT.md §10). Deterministic, no
 * I/O. The lock/plan logic is the security-relevant surface — the UI must never
 * grant access it cannot prove, so the defensive default and lock rules are the
 * priority here (real enforcement is server-side; this guards the hint).
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

describe('isLocked — entitlement gating', () => {
  const proStrategy = STRATEGIES.find((s) => s.access === 'pro');
  const basicStrategy = STRATEGIES.find((s) => s.access === 'basic');

  it('has at least one pro and one basic playbook (matrix sanity)', () => {
    expect(proStrategy).toBeDefined();
    expect(basicStrategy).toBeDefined();
  });

  it('locks pro playbooks for basic plans only', () => {
    if (!proStrategy) throw new Error('fixture missing');
    expect(isLocked(proStrategy, 'basic')).toBe(true);
    expect(isLocked(proStrategy, 'pro')).toBe(false);
    expect(isLocked(proStrategy, 'elite')).toBe(false);
  });

  it('never locks basic playbooks for any plan', () => {
    if (!basicStrategy) throw new Error('fixture missing');
    (['basic', 'pro', 'elite'] satisfies Plan[]).forEach((plan) => {
      expect(isLocked(basicStrategy, plan)).toBe(false);
    });
  });
});

describe('resolveCategory — URL filter param', () => {
  it('returns null (All) for missing or unknown values', () => {
    expect(resolveCategory(undefined)).toBeNull();
    expect(resolveCategory('')).toBeNull();
    expect(resolveCategory('Bogus')).toBeNull();
  });

  it('resolves each valid category exactly', () => {
    expect(resolveCategory('Technical')).toBe('Technical');
    expect(resolveCategory('Smart Money')).toBe('Smart Money');
    expect(resolveCategory('Trend')).toBe('Trend');
    expect(resolveCategory('Range')).toBe('Range');
  });
});

describe('filterByCategory', () => {
  it('returns the full list for null (All)', () => {
    expect(filterByCategory(STRATEGIES, null)).toHaveLength(STRATEGIES.length);
  });

  it('narrows to a single category', () => {
    const technical = filterByCategory(STRATEGIES, 'Technical');
    expect(technical.length).toBeGreaterThan(0);
    expect(technical.every((s) => s.category === 'Technical')).toBe(true);
  });
});

describe('dataset integrity', () => {
  it('ships exactly the six PRD §10 playbooks', () => {
    expect(STRATEGIES).toHaveLength(6);
  });

  it('has unique, non-empty slugs', () => {
    const slugs = allStrategySlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((s) => s.length > 0)).toBe(true);
  });

  it('resolves every slug back to its strategy', () => {
    for (const slug of allStrategySlugs()) {
      expect(getStrategyBySlug(slug)?.slug).toBe(slug);
    }
  });

  it('returns undefined for an unknown slug', () => {
    expect(getStrategyBySlug('does-not-exist')).toBeUndefined();
  });

  it('gives every playbook a complete educational body', () => {
    for (const s of STRATEGIES) {
      expect(s.body.concept.length).toBeGreaterThan(0);
      expect(s.body.rules.length).toBeGreaterThan(0);
      expect(s.body.setupCriteria.length).toBeGreaterThan(0);
      expect(s.body.invalidation.length).toBeGreaterThan(0);
      expect(s.body.riskNotes.length).toBeGreaterThan(0);
      expect(s.body.examples.length).toBeGreaterThan(0);
      expect(s.body.relatedLessons.length).toBeGreaterThan(0);
      expect(s.body.checklist.length).toBeGreaterThan(0);
    }
  });
});
