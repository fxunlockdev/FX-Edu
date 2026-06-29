import { describe, expect, it } from 'vitest';
import {
  deriveDashboard,
  greetingName,
  timeGreeting,
  type DashboardSignals,
} from './dashboard-data';

/**
 * Pure dashboard-derivation tests (M18 / PROJECT.md §18). Deterministic, no I/O,
 * no clock reliance (we inject `hour`). Mirrors the analytics/journal test style.
 */
function signals(overrides: Partial<DashboardSignals> = {}): DashboardSignals {
  return {
    profile: { onboardedAt: '2026-06-01T00:00:00Z', accountSize: '5000' },
    tradeCount: 3,
    ...overrides,
  };
}

describe('deriveDashboard — new vs returning', () => {
  it('treats a member with no profile and no trades as new', () => {
    const model = deriveDashboard(signals({ profile: null, tradeCount: 0 }));
    expect(model.isNewUser).toBe(true);
    expect(model.onboarded).toBe(false);
    expect(model.hasTrades).toBe(false);
  });

  it('stays new when onboarded but has not logged a trade yet', () => {
    const model = deriveDashboard(
      signals({ profile: { onboardedAt: '2026-06-01T00:00:00Z', accountSize: '5000' }, tradeCount: 0 }),
    );
    expect(model.onboarded).toBe(true);
    expect(model.isNewUser).toBe(true);
  });

  it('stays new when a trade exists but onboarding is incomplete', () => {
    const model = deriveDashboard(signals({ profile: null, tradeCount: 4 }));
    expect(model.hasTrades).toBe(true);
    expect(model.isNewUser).toBe(true);
  });

  it('becomes a returning member once onboarded AND at least one trade exists', () => {
    const model = deriveDashboard(signals({ tradeCount: 1 }));
    expect(model.isNewUser).toBe(false);
    expect(model.onboarded).toBe(true);
    expect(model.hasTrades).toBe(true);
  });
});

describe('deriveDashboard — checklist', () => {
  it('marks profile, account-size and first-trade steps done from the signals', () => {
    const model = deriveDashboard(signals());
    const byId = Object.fromEntries(model.checklist.map((i) => [i.id, i]));
    expect(byId['profile']?.done).toBe(true);
    expect(byId['account-size']?.done).toBe(true);
    expect(byId['first-trade']?.done).toBe(true);
    // Pending-module steps are never auto-done.
    expect(byId['entry-course']?.done).toBe(false);
    expect(byId['entry-course']?.pending).toBe(true);
  });

  it('computes done count and whole-percent completion', () => {
    const model = deriveDashboard(signals());
    expect(model.checklist).toHaveLength(7);
    expect(model.checklistDone).toBe(3);
    expect(model.checklistPercent).toBe(Math.round((3 / 7) * 100)); // 43
  });

  it('reports 0% for a brand-new member', () => {
    const model = deriveDashboard(signals({ profile: null, tradeCount: 0 }));
    expect(model.checklistDone).toBe(0);
    expect(model.checklistPercent).toBe(0);
  });

  it('account-size step toggles independently of onboarding', () => {
    const model = deriveDashboard(
      signals({ profile: { onboardedAt: '2026-06-01T00:00:00Z', accountSize: null }, tradeCount: 0 }),
    );
    const byId = Object.fromEntries(model.checklist.map((i) => [i.id, i]));
    expect(byId['profile']?.done).toBe(true);
    expect(byId['account-size']?.done).toBe(false);
  });

  it('every checklist item exposes a non-empty in-app href', () => {
    const model = deriveDashboard(signals());
    for (const item of model.checklist) {
      expect(item.href.startsWith('/')).toBe(true);
    }
  });
});

describe('greetingName', () => {
  it('prefers a provided full name (first token only)', () => {
    expect(greetingName('Alex Rivera', 'someone@example.com')).toBe('Alex');
  });

  it('derives a title-cased head from the email local-part', () => {
    expect(greetingName(null, 'alex.rivera@example.com')).toBe('Alex');
    expect(greetingName(undefined, 'jordan@example.com')).toBe('Jordan');
  });

  it('falls back to "trader" with no usable signal', () => {
    expect(greetingName(null, null)).toBe('trader');
    expect(greetingName('   ', '')).toBe('trader');
  });
});

describe('timeGreeting', () => {
  it('is morning before noon', () => {
    expect(timeGreeting(8)).toBe('Good morning');
  });
  it('is afternoon midday', () => {
    expect(timeGreeting(14)).toBe('Good afternoon');
  });
  it('is evening at night', () => {
    expect(timeGreeting(21)).toBe('Good evening');
  });
});
