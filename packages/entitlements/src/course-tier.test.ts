import { describe, expect, it } from 'vitest';
import { canAccessCourseTier } from './decide';
import type {
  CourseTier,
  Decision,
  EntitlementContext,
  MediaTokenState,
  Plan,
  SubscriptionStatus,
} from './types';

const tierCtx = (
  plan: Plan,
  tier: CourseTier,
  over: Partial<EntitlementContext> = {},
): EntitlementContext => ({
  plan,
  subscriptionStatus: 'active',
  featureKey: `tier_${tier}` as EntitlementContext['featureKey'],
  tier,
  ...over,
});

const ALL_TIERS: readonly CourseTier[] = [
  'entry',
  'beginner',
  'intermediate',
  'advanced',
  'psychology',
];

describe('canAccessCourseTier — Basic plan', () => {
  it('allows Entry and Beginner', () => {
    expect(canAccessCourseTier(tierCtx('basic', 'entry'))).toBe('allow');
    expect(canAccessCourseTier(tierCtx('basic', 'beginner'))).toBe('allow');
  });

  it('locks Intermediate, Advanced, Psychology (upgrade path)', () => {
    expect(canAccessCourseTier(tierCtx('basic', 'intermediate'))).toBe('locked');
    expect(canAccessCourseTier(tierCtx('basic', 'advanced'))).toBe('locked');
    expect(canAccessCourseTier(tierCtx('basic', 'psychology'))).toBe('locked');
  });
});

describe('canAccessCourseTier — Pro and Elite plans', () => {
  for (const plan of ['pro', 'elite'] as const) {
    for (const tier of ALL_TIERS) {
      it(`${plan} allows ${tier}`, () => {
        expect(canAccessCourseTier(tierCtx(plan, tier))).toBe('allow');
      });
    }
  }
});

describe('canAccessCourseTier — inactive subscription', () => {
  const inactive: readonly SubscriptionStatus[] = [
    'past_due',
    'canceled',
    'incomplete',
    'unpaid',
    'paused',
  ];

  it('denies an included tier when subscription is inactive (not locked)', () => {
    for (const status of inactive) {
      // Pro includes advanced, but lapsed payment → deny, not an upgrade prompt.
      expect(
        canAccessCourseTier(tierCtx('pro', 'advanced', { subscriptionStatus: status })),
      ).toBe('deny');
    }
  });

  it('still locks a not-included tier regardless of status (upgrade path persists)', () => {
    for (const status of inactive) {
      expect(
        canAccessCourseTier(tierCtx('basic', 'advanced', { subscriptionStatus: status })),
      ).toBe('locked');
    }
  });
});

describe('canAccessCourseTier — media token gating', () => {
  it('allows playback with a valid token', () => {
    expect(
      canAccessCourseTier(tierCtx('pro', 'advanced', { mediaTokenState: 'valid' })),
    ).toBe('allow');
  });

  it('allows when no media token concern is present', () => {
    expect(
      canAccessCourseTier(tierCtx('pro', 'advanced', { mediaTokenState: 'none' })),
    ).toBe('allow');
  });

  it.each<MediaTokenState>(['expired', 'revoked'])(
    'hard-denies an entitled tier when the media token is %s',
    (state) => {
      expect(
        canAccessCourseTier(tierCtx('pro', 'advanced', { mediaTokenState: state })),
      ).toBe('deny');
    },
  );

  it('does not let a valid token rescue a locked tier', () => {
    // Basic cannot reach Advanced even with a (somehow) valid token.
    expect(
      canAccessCourseTier(tierCtx('basic', 'advanced', { mediaTokenState: 'valid' })),
    ).toBe('locked');
  });
});

describe('canAccessCourseTier — missing tier falls back to courses surface', () => {
  it('uses the generic courses decision when tier is undefined', () => {
    const result: Decision = canAccessCourseTier({
      plan: 'basic',
      subscriptionStatus: 'active',
      featureKey: 'courses',
    });
    // Basic can reach the course surface.
    expect(result).toBe('allow');
  });
});
