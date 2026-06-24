import { Inject, Injectable } from '@nestjs/common';
import {
  ENTITLEMENT_DECIDER,
  type EntitlementDecider,
  type EntitlementDecision,
  type FeatureKey,
  type Plan,
  type SubscriptionStatus,
} from './entitlement.types';
import type { AuthContext } from '../../common/auth/auth-context';

/** The subscription facts needed to decide entitlement, loaded per user/org. */
export interface SubscriptionSnapshot {
  readonly plan: Plan;
  readonly status: SubscriptionStatus;
}

/**
 * Orchestrates entitlement decisions: load the caller's subscription snapshot,
 * then run the pure decider. The decision is the authority; any Redis cache
 * added later is an optimization re-checked on every gated call (§6.2).
 */
@Injectable()
export class EntitlementsService {
  constructor(
    @Inject(ENTITLEMENT_DECIDER)
    private readonly decider: EntitlementDecider,
  ) {}

  async decideFor(
    auth: AuthContext,
    feature: FeatureKey,
    resourceTier?: Plan,
  ): Promise<EntitlementDecision> {
    const snapshot = await this.loadSubscription(auth);
    return this.decider.decide({
      userId: auth.sub,
      orgId: auth.orgId,
      plan: snapshot.plan,
      subscriptionStatus: snapshot.status,
      feature,
      resourceTier,
    });
  }

  /** Convenience: decide a set of features at once (used by GET /entitlements). */
  async decideMany(
    auth: AuthContext,
    features: readonly FeatureKey[],
  ): Promise<EntitlementDecision[]> {
    const snapshot = await this.loadSubscription(auth);
    return features.map((feature) =>
      this.decider.decide({
        userId: auth.sub,
        orgId: auth.orgId,
        plan: snapshot.plan,
        subscriptionStatus: snapshot.status,
        feature,
      }),
    );
  }

  /**
   * Load the caller's plan + subscription status.
   *
   * TODO: wire @fxunlock/db — read from `subscriptions` + `entitlements`
   * (Stripe-webhook-sourced, §6.2), preferably through a short-TTL Redis cache
   * invalidated on `entitlement.changed`. Until then we return a conservative
   * default so nothing paid is granted by accident: an inactive Basic plan.
   */
  private async loadSubscription(
    _auth: AuthContext,
  ): Promise<SubscriptionSnapshot> {
    return { plan: 'basic', status: 'none' };
  }
}
