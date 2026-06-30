import { describe, expect, it } from 'vitest';
import { canAccessFeature, resolveEntitlements } from './decide';
import { ALL_FEATURE_KEYS, DATA_PRESERVING_FEATURES } from './matrix';
import type { EntitlementContext, FeatureKey, SubscriptionStatus } from './types';

const ctx = (over: Partial<EntitlementContext> & Pick<EntitlementContext, 'featureKey'>): EntitlementContext => ({
  plan: 'pro',
  subscriptionStatus: 'active',
  ...over,
});

const INACTIVE: readonly SubscriptionStatus[] = [
  'past_due',
  'canceled',
  'incomplete',
  'unpaid',
  'paused',
];

const GATED_PRO_FEATURES: readonly FeatureKey[] = [
  'webinars',
  'ai_tutor',
  'analytics',
  'community',
  'trade_ideas',
  'prop_firm',
  'strategy_library',
];

describe('canAccessFeature — active Pro grants gated features', () => {
  for (const key of GATED_PRO_FEATURES) {
    it(`pro/active → ${key} = allow`, () => {
      expect(canAccessFeature(ctx({ featureKey: key }))).toBe('allow');
    });
  }
});

describe('canAccessFeature — locked vs deny semantics', () => {
  it('Basic sees Pro features as LOCKED (upgrade path), not denied', () => {
    for (const key of GATED_PRO_FEATURES) {
      expect(canAccessFeature(ctx({ plan: 'basic', featureKey: key }))).toBe('locked');
    }
  });

  it('a gated feature on an inactive Pro sub is DENY, not locked', () => {
    // The plan includes it, so it is not an upgrade prompt — it is a hard deny
    // because payment lapsed.
    for (const status of INACTIVE) {
      expect(
        canAccessFeature(ctx({ plan: 'pro', subscriptionStatus: status, featureKey: 'analytics' })),
      ).toBe('deny');
    }
  });

  it('locked means a higher plan offers it; deny means no path', () => {
    // Basic + intermediate tier exists on Pro → locked.
    expect(
      canAccessFeature(ctx({ plan: 'basic', featureKey: 'tier_intermediate', tier: 'intermediate' })),
    ).toBe('locked');
  });
});

describe('canAccessFeature — inactive subscription denies gated access', () => {
  for (const status of INACTIVE) {
    it(`pro/${status} → webinars = deny`, () => {
      expect(
        canAccessFeature(ctx({ subscriptionStatus: status, featureKey: 'webinars' })),
      ).toBe('deny');
    });
    it(`pro/${status} → ai_tutor = deny`, () => {
      expect(
        canAccessFeature(ctx({ subscriptionStatus: status, featureKey: 'ai_tutor' })),
      ).toBe('deny');
    });
  }

  it('whole entitlement map for inactive Pro denies every gated feature but keeps owned data', () => {
    const map = resolveEntitlements('pro', 'past_due');
    expect(map.webinars).toBe('deny');
    expect(map.ai_tutor).toBe('deny');
    expect(map.analytics).toBe('deny');
    // Owned data survives.
    expect(map.journal).toBe('allow');
    expect(map.certificates).toBe('allow');
    expect(map.risk_calculator).toBe('allow');
  });
});

describe('downgrade preserves data access but locks Pro views', () => {
  // Scenario: a former Pro user downgrades to Basic (active Basic sub).
  it('journal, certificates, risk calculator stay accessible on Basic', () => {
    for (const key of DATA_PRESERVING_FEATURES) {
      expect(canAccessFeature(ctx({ plan: 'basic', featureKey: key }))).toBe('allow');
    }
  });

  it('owned data stays accessible even if the new sub is inactive (lapsed)', () => {
    for (const status of INACTIVE) {
      expect(
        canAccessFeature(ctx({ plan: 'basic', subscriptionStatus: status, featureKey: 'journal' })),
      ).toBe('allow');
      expect(
        canAccessFeature(ctx({ plan: 'basic', subscriptionStatus: status, featureKey: 'certificates' })),
      ).toBe('allow');
    }
  });

  it('Pro analytics view locks after downgrade to Basic', () => {
    // The journal data is preserved (above), but the Pro analytics *view* locks.
    expect(canAccessFeature(ctx({ plan: 'basic', featureKey: 'analytics' }))).toBe('locked');
    expect(canAccessFeature(ctx({ plan: 'basic', featureKey: 'community' }))).toBe('locked');
  });
});

describe('canAccessFeature — free public webinar override', () => {
  it('a free_public webinar is allowed for Basic regardless of plan gate', () => {
    expect(
      canAccessFeature(ctx({ plan: 'basic', featureKey: 'webinars', webinarAccess: 'free_public' })),
    ).toBe('allow');
  });

  it('a free_public webinar is allowed even on an inactive subscription', () => {
    expect(
      canAccessFeature(
        ctx({
          plan: 'basic',
          subscriptionStatus: 'canceled',
          featureKey: 'webinars',
          webinarAccess: 'free_public',
        }),
      ),
    ).toBe('allow');
  });

  it('a registered (non-public) webinar still requires the plan gate', () => {
    // registered alone does not bypass Pro entitlement.
    expect(
      canAccessFeature(ctx({ plan: 'basic', featureKey: 'webinars', webinarAccess: 'registered' })),
    ).toBe('locked');
  });
});

describe('canAccessFeature — totality and immutability', () => {
  it('returns a valid decision for every feature key on every plan/status', () => {
    const plans = ['basic', 'pro', 'elite'] as const;
    const statuses: SubscriptionStatus[] = [
      'active',
      'trialing',
      'past_due',
      'canceled',
      'incomplete',
      'unpaid',
      'paused',
    ];
    for (const plan of plans) {
      for (const status of statuses) {
        for (const key of ALL_FEATURE_KEYS) {
          const d = canAccessFeature({ plan, subscriptionStatus: status, featureKey: key });
          expect(['allow', 'deny', 'locked']).toContain(d);
        }
      }
    }
  });

  it('does not mutate the input context', () => {
    const input = Object.freeze(
      ctx({ plan: 'basic', featureKey: 'analytics' }),
    ) as EntitlementContext;
    expect(() => canAccessFeature(input)).not.toThrow();
    expect(input.plan).toBe('basic');
    expect(input.featureKey).toBe('analytics');
  });
});
