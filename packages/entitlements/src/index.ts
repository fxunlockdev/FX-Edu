/**
 * @fxunlock/entitlements — pure entitlement decision logic.
 *
 * No I/O, no clock, no mutation. Encodes the PRD §5 plan→feature matrix and
 * exposes total decision functions the API and RLS enforce server-side. UI
 * locks are hints only; this package is the policy, not the enforcement point.
 */
export {
  canAccessCourseTier,
  canAccessFeature,
  isSubscriptionActive,
  resolveEntitlements,
} from './decide';

export {
  ALL_FEATURE_KEYS,
  DATA_PRESERVING_FEATURES,
  PLAN_FEATURES,
  TIER_FEATURE_KEY,
} from './matrix';

export type {
  CourseTier,
  Decision,
  EntitlementContext,
  EntitlementMap,
  FeatureKey,
  MediaTokenState,
  Plan,
  SubscriptionStatus,
  WebinarAccess,
} from './types';
