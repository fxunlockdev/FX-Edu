import { describe, expect, it } from 'vitest';
import {
  ALL_FEATURE_KEYS,
  DATA_PRESERVING_FEATURES,
  PLAN_FEATURES,
  TIER_FEATURE_KEY,
} from './matrix';
import { resolveEntitlements } from './decide';
import type { Decision, FeatureKey, Plan } from './types';

/**
 * Expected entitlement decisions for an ACTIVE subscription, per PRD §5.
 * `allow` = included, `locked` = a higher plan offers it, `deny` = no path.
 */
const EXPECTED_ACTIVE: Readonly<Record<Plan, Readonly<Record<FeatureKey, Decision>>>> = {
  basic: {
    courses: 'allow',
    tier_entry: 'allow',
    tier_beginner: 'allow',
    tier_intermediate: 'locked',
    tier_advanced: 'locked',
    tier_psychology: 'locked',
    webinars: 'locked',
    ai_tutor: 'locked',
    analytics: 'locked',
    community: 'locked',
    trade_ideas: 'locked',
    prop_firm: 'locked',
    strategy_library: 'locked',
    certificates: 'allow',
    journal: 'allow',
    risk_calculator: 'allow',
  },
  pro: {
    courses: 'allow',
    tier_entry: 'allow',
    tier_beginner: 'allow',
    tier_intermediate: 'allow',
    tier_advanced: 'allow',
    tier_psychology: 'allow',
    webinars: 'allow',
    ai_tutor: 'allow',
    analytics: 'allow',
    community: 'allow',
    trade_ideas: 'allow',
    prop_firm: 'allow',
    strategy_library: 'allow',
    certificates: 'allow',
    journal: 'allow',
    risk_calculator: 'allow',
  },
  elite: {
    courses: 'allow',
    tier_entry: 'allow',
    tier_beginner: 'allow',
    tier_intermediate: 'allow',
    tier_advanced: 'allow',
    tier_psychology: 'allow',
    webinars: 'allow',
    ai_tutor: 'allow',
    analytics: 'allow',
    community: 'allow',
    trade_ideas: 'allow',
    prop_firm: 'allow',
    strategy_library: 'allow',
    certificates: 'allow',
    journal: 'allow',
    risk_calculator: 'allow',
  },
};

const PLANS: readonly Plan[] = ['basic', 'pro', 'elite'];

describe('matrix integrity', () => {
  it('every plan defines a boolean for every feature key', () => {
    for (const plan of PLANS) {
      for (const key of ALL_FEATURE_KEYS) {
        expect(typeof PLAN_FEATURES[plan][key]).toBe('boolean');
      }
    }
  });

  it('ALL_FEATURE_KEYS has no duplicates and 16 entries', () => {
    expect(new Set(ALL_FEATURE_KEYS).size).toBe(ALL_FEATURE_KEYS.length);
    expect(ALL_FEATURE_KEYS.length).toBe(16);
  });

  it('Pro is a superset of Basic, Elite a superset of Pro', () => {
    for (const key of ALL_FEATURE_KEYS) {
      if (PLAN_FEATURES.basic[key]) expect(PLAN_FEATURES.pro[key]).toBe(true);
      if (PLAN_FEATURES.pro[key]) expect(PLAN_FEATURES.elite[key]).toBe(true);
    }
  });

  it('TIER_FEATURE_KEY maps each tier to a tier_* feature key', () => {
    for (const [, key] of Object.entries(TIER_FEATURE_KEY)) {
      expect(key.startsWith('tier_')).toBe(true);
      expect(ALL_FEATURE_KEYS).toContain(key);
    }
  });

  it('data-preserving features are journal, risk_calculator, certificates', () => {
    expect([...DATA_PRESERVING_FEATURES].sort()).toEqual(
      ['certificates', 'journal', 'risk_calculator'].sort(),
    );
  });

  it('the matrix objects are frozen (immutable)', () => {
    expect(Object.isFrozen(PLAN_FEATURES)).toBe(true);
    expect(Object.isFrozen(PLAN_FEATURES.basic)).toBe(true);
    expect(Object.isFrozen(PLAN_FEATURES.pro)).toBe(true);
    expect(Object.isFrozen(PLAN_FEATURES.elite)).toBe(true);
  });
});

describe('resolveEntitlements — each plan × each feature (active)', () => {
  for (const plan of PLANS) {
    describe(`plan: ${plan}`, () => {
      const map = resolveEntitlements(plan, 'active');
      for (const key of ALL_FEATURE_KEYS) {
        it(`${key} → ${EXPECTED_ACTIVE[plan][key]}`, () => {
          expect(map[key]).toBe(EXPECTED_ACTIVE[plan][key]);
        });
      }
    });
  }

  it('returns a frozen, total map', () => {
    const map = resolveEntitlements('pro', 'active');
    expect(Object.isFrozen(map)).toBe(true);
    for (const key of ALL_FEATURE_KEYS) {
      expect(map[key]).toBeDefined();
    }
  });
});
