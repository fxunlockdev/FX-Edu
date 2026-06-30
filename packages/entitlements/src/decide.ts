import {
  ALL_FEATURE_KEYS,
  DATA_PRESERVING_FEATURES,
  PLAN_FEATURES,
  TIER_FEATURE_KEY,
} from './matrix';
import type {
  CourseTier,
  Decision,
  EntitlementContext,
  EntitlementMap,
  MediaTokenState,
  Plan,
  SubscriptionStatus,
  WebinarAccess,
} from './types';

/**
 * Pure entitlement decision logic. Every function here is total (defined for
 * all inputs) and deterministic — no I/O, no clock reads, no mutation. This is
 * the single place entitlement *policy* lives; the API and RLS enforce it.
 */

/** Statuses that grant access to gated features. */
const ACTIVE_STATUSES: ReadonlySet<SubscriptionStatus> = new Set<SubscriptionStatus>([
  'active',
  'trialing',
]);

/**
 * Is the subscription in a state that grants paid access?
 *
 * Only `active` and `trialing` qualify. `past_due`, `paused`, `incomplete`,
 * `unpaid`, and `canceled` all deny gated access (data is preserved elsewhere).
 */
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return ACTIVE_STATUSES.has(status);
}

/** Does the plan include this feature at all (ignoring subscription state)? */
function planIncludes(plan: Plan, featureKey: EntitlementContext['featureKey']): boolean {
  return PLAN_FEATURES[plan][featureKey] === true;
}

/** Does any plan above `basic` include this feature? (used for lock vs deny). */
function higherPlanIncludes(featureKey: EntitlementContext['featureKey']): boolean {
  return (
    PLAN_FEATURES.pro[featureKey] === true || PLAN_FEATURES.elite[featureKey] === true
  );
}

/**
 * Is a media token usable? `none`/`undefined` is permissive here (the caller is
 * not minting playback); `expired`/`revoked` is a hard deny; `valid` allows.
 */
function mediaTokenBlocks(state: MediaTokenState | undefined): boolean {
  return state === 'expired' || state === 'revoked';
}

/**
 * Resolve the decision for a single course tier given plan + status.
 *
 * - Inactive subscription → `deny` (payment lapsed; not an upgrade prompt).
 * - Plan includes the tier → `allow`.
 * - A higher plan includes it → `locked` (render upgrade path).
 * - Otherwise → `deny`.
 */
function decideTier(plan: Plan, status: SubscriptionStatus, tier: CourseTier): Decision {
  const featureKey = TIER_FEATURE_KEY[tier];
  if (planIncludes(plan, featureKey)) {
    return isSubscriptionActive(status) ? 'allow' : 'deny';
  }
  return higherPlanIncludes(featureKey) ? 'locked' : 'deny';
}

/**
 * Can the user access the requested course tier?
 *
 * Requires `ctx.tier`. If absent, falls back to the generic `courses` surface
 * decision so the function stays total. Media-token state, when supplied,
 * can hard-deny an otherwise-allowed tier (expired/revoked playback).
 */
export function canAccessCourseTier(ctx: EntitlementContext): Decision {
  if (ctx.tier === undefined) {
    return canAccessFeature({ ...ctx, featureKey: 'courses' });
  }

  const tierDecision = decideTier(ctx.plan, ctx.subscriptionStatus, ctx.tier);
  if (tierDecision !== 'allow') return tierDecision;

  // An allowed tier can still be blocked by a bad media token at play time.
  return mediaTokenBlocks(ctx.mediaTokenState) ? 'deny' : 'allow';
}

/**
 * Webinar-specific override: a `free_public` webinar is reachable by any plan
 * (PRD §8.6 public registration), and a `registered` grant means the user
 * holds a seat. Returns a decision, or `null` when no webinar override applies.
 */
function decideWebinarOverride(
  featureKey: EntitlementContext['featureKey'],
  webinarAccess: WebinarAccess | undefined,
): Decision | null {
  if (featureKey !== 'webinars' || webinarAccess === undefined) return null;
  if (webinarAccess === 'free_public') return 'allow';
  return null;
}

/**
 * The general feature gate. Resolves any `FeatureKey` to a `Decision`.
 *
 * Order of evaluation:
 *  1. Tier features delegate to {@link canAccessCourseTier}.
 *  2. Free-public webinars are allowed regardless of plan.
 *  3. Data-preserving features (journal, risk calc, certificates) stay
 *     accessible after a downgrade even when the subscription is inactive,
 *     because the user's own data must remain reachable (PROJECT.md §6.2).
 *  4. Plan inclusion + active status → `allow`.
 *  5. Plan includes it but subscription inactive → `deny` (lapsed payment).
 *  6. A higher plan includes it → `locked` (upgrade path).
 *  7. Otherwise → `deny`.
 */
export function canAccessFeature(ctx: EntitlementContext): Decision {
  const { plan, subscriptionStatus: status, featureKey } = ctx;

  // 1. Per-tier course access.
  if (featureKey.startsWith('tier_') && ctx.tier !== undefined) {
    return canAccessCourseTier(ctx);
  }

  // 2. Free public webinar registration bypasses the plan gate.
  const webinarOverride = decideWebinarOverride(featureKey, ctx.webinarAccess);
  if (webinarOverride !== null) return webinarOverride;

  const included = planIncludes(plan, featureKey);

  // 3. Data the user owns stays reachable after downgrade / lapse.
  if (included && DATA_PRESERVING_FEATURES.includes(featureKey)) {
    return 'allow';
  }

  // 4 & 5. Plan includes it: gate on subscription status.
  if (included) {
    return isSubscriptionActive(status) ? 'allow' : 'deny';
  }

  // 6 & 7. Not included: locked if a higher plan offers it, else denied.
  return higherPlanIncludes(featureKey) ? 'locked' : 'deny';
}

/**
 * Build the complete feature → decision map for a plan + status pair.
 *
 * This is what the API caches per user (short TTL, invalidated on
 * `entitlement.changed`, PROJECT.md §6.2). It evaluates every feature with the
 * generic gate; tier sub-keys are resolved against their own plan inclusion.
 * For course tiers it intentionally does NOT require a media token (that is a
 * per-playback concern), so the map reflects pure plan/status entitlement.
 */
export function resolveEntitlements(
  plan: Plan,
  status: SubscriptionStatus,
): EntitlementMap {
  const entries = ALL_FEATURE_KEYS.map((featureKey): readonly [string, Decision] => {
    const decision = canAccessFeature({ plan, subscriptionStatus: status, featureKey });
    return [featureKey, decision] as const;
  });

  return Object.freeze(Object.fromEntries(entries)) as EntitlementMap;
}
