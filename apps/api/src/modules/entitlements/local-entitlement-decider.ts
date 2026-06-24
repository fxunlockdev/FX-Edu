import { Injectable } from '@nestjs/common';
import {
  type EntitlementContext,
  type EntitlementDecider,
  type EntitlementDecision,
  type FeatureKey,
  type Plan,
} from './entitlement.types';

/**
 * Temporary, pure entitlement decider.
 *
 * Deterministic and side-effect-free, exactly like the package it stands in for.
 * Encodes the PRD plan matrix (§5): Basic = Entry/Beginner + journal/risk;
 * Pro = everything; Elite ⊇ Pro. A non-active subscription locks all paid
 * features (downgrade/expiry preserves data but flips gated views to locked).
 *
 * TODO: wire @fxunlock/entitlements — swap this for the package's decide().
 */
const PLAN_RANK: Readonly<Record<Plan, number>> = {
  basic: 0,
  pro: 1,
  elite: 2,
};

/** Minimum plan that grants each feature. */
const FEATURE_MIN_PLAN: Readonly<Record<FeatureKey, Plan>> = {
  'course.entry': 'basic',
  'course.beginner': 'basic',
  'course.intermediate': 'pro',
  'course.advanced': 'pro',
  'course.psychology': 'pro',
  'webinars.live': 'pro',
  'webinars.replays': 'pro',
  'ai.tutor': 'pro',
  analytics: 'pro',
  community: 'pro',
  trade_ideas: 'pro',
  prop_firm: 'pro',
  'lesson.playback': 'basic',
};

const ACTIVE_STATUSES: ReadonlySet<string> = new Set(['active', 'trialing']);

@Injectable()
export class LocalEntitlementDecider implements EntitlementDecider {
  decide(context: EntitlementContext): EntitlementDecision {
    const { feature, plan, subscriptionStatus, resourceTier } = context;

    if (!ACTIVE_STATUSES.has(subscriptionStatus)) {
      return this.lock(feature, `subscription_${subscriptionStatus}`);
    }

    const requiredPlan = resourceTier ?? FEATURE_MIN_PLAN[feature];
    const hasPlan = PLAN_RANK[plan] >= PLAN_RANK[requiredPlan];

    if (!hasPlan) {
      return this.lock(feature, `requires_${requiredPlan}`);
    }

    return {
      outcome: 'allow',
      feature,
      reason: 'entitled',
    };
  }

  private lock(feature: FeatureKey, reason: string): EntitlementDecision {
    // "locked" (not "deny") so the UI can render a designed upgrade state
    // (PRD UX §3: locked ≠ broken). Server still refuses the resource.
    return { outcome: 'locked', feature, reason };
  }
}
