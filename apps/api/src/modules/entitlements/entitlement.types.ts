/**
 * Local entitlement contract.
 *
 * The real decision logic lives in the pure, unit-tested `@fxunlock/entitlements`
 * package (PROJECT.md §6.2 — "no I/O"). Until that package is built we define the
 * interface here and ship a temporary in-module implementation behind it, so call
 * sites (guards, media token minting) are stable.
 *
 * TODO: wire @fxunlock/entitlements — replace LocalEntitlementDecider with the
 * package's pure decide() and delete these local types in favour of its exports.
 */

export type EntitlementOutcome = 'allow' | 'deny' | 'locked';

export type Plan = 'basic' | 'pro' | 'elite';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'none';

/**
 * A feature key the product gates on. Mirrors the PRD's plan matrix (§5) and the
 * entitlements feature_key column (§9 data model).
 */
export type FeatureKey =
  | 'course.entry'
  | 'course.beginner'
  | 'course.intermediate'
  | 'course.advanced'
  | 'course.psychology'
  | 'webinars.live'
  | 'webinars.replays'
  | 'ai.tutor'
  | 'analytics'
  | 'community'
  | 'trade_ideas'
  | 'prop_firm'
  | 'lesson.playback';

/** Everything the decision needs — pure inputs, no I/O. */
export interface EntitlementContext {
  readonly userId: string;
  readonly orgId: string;
  readonly plan: Plan;
  readonly subscriptionStatus: SubscriptionStatus;
  readonly feature: FeatureKey;
  /** Optional resource the feature is scoped to (e.g. a lesson's required tier). */
  readonly resourceTier?: Plan;
}

export interface EntitlementDecision {
  readonly outcome: EntitlementOutcome;
  readonly feature: FeatureKey;
  readonly reason: string;
}

/** Decision boundary the guard and services depend on. */
export interface EntitlementDecider {
  decide(context: EntitlementContext): EntitlementDecision;
}

export const ENTITLEMENT_DECIDER = 'FX_ENTITLEMENT_DECIDER';
