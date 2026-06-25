import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { plans, subscriptions, users } from '@fxunlock/db';
import {
  resolveEntitlements,
  TIER_FEATURE_KEY,
  type CourseTier,
  type EntitlementMap,
  type MediaTokenState,
  type Plan,
  type SubscriptionStatus,
} from '@fxunlock/entitlements';
import {
  ENTITLEMENT_DECIDER,
  type EntitlementDecider,
  type EntitlementDecision,
  type FeatureKey,
} from './entitlement.types';
import type { AuthContext } from '../../common/auth/auth-context';
import { TenantDbService } from '../db/tenant-db.service';

/** The subscription facts needed to decide entitlement, loaded per user/org. */
export interface SubscriptionSnapshot {
  readonly plan: Plan;
  readonly status: SubscriptionStatus;
}

/**
 * Conservative default when a caller has no subscription row: an inactive Basic
 * plan. Nothing paid is granted by accident; data-preserving features stay
 * reachable via the package's own rules.
 */
const DEFAULT_SNAPSHOT: SubscriptionSnapshot = Object.freeze({
  plan: 'basic',
  status: 'incomplete',
});

/**
 * Orchestrates entitlement decisions: load the caller's subscription snapshot
 * from the DB (Stripe-webhook-sourced, §6.2), then run the package-backed
 * decider. The decision is the authority; any Redis cache added later is an
 * optimization re-checked on every gated call.
 */
@Injectable()
export class EntitlementsService {
  constructor(
    @Inject(ENTITLEMENT_DECIDER)
    private readonly decider: EntitlementDecider,
    private readonly tenantDb: TenantDbService,
  ) {}

  async decideFor(
    auth: AuthContext,
    feature: FeatureKey,
  ): Promise<EntitlementDecision> {
    const snapshot = await this.loadSubscription(auth);
    return this.decider.decide({
      plan: snapshot.plan,
      subscriptionStatus: snapshot.status,
      orgId: auth.orgId,
      featureKey: feature,
    });
  }

  /**
   * Decide access to a course tier (used by media-token minting, §6.4). Passes
   * the tier and its gating feature key plus the per-playback media-token state
   * to the package, which can hard-deny an otherwise-allowed tier on an
   * expired/revoked token.
   */
  async decideCourseTier(
    auth: AuthContext,
    tier: CourseTier,
    mediaTokenState?: MediaTokenState,
  ): Promise<EntitlementDecision> {
    const snapshot = await this.loadSubscription(auth);
    return this.decider.decide({
      plan: snapshot.plan,
      subscriptionStatus: snapshot.status,
      orgId: auth.orgId,
      featureKey: TIER_FEATURE_KEY[tier],
      tier,
      mediaTokenState,
    });
  }

  /** Decide a set of features at once (used by GET /entitlements). */
  async decideMany(
    auth: AuthContext,
    features: readonly FeatureKey[],
  ): Promise<EntitlementDecision[]> {
    const snapshot = await this.loadSubscription(auth);
    return features.map((feature) =>
      this.decider.decide({
        plan: snapshot.plan,
        subscriptionStatus: snapshot.status,
        orgId: auth.orgId,
        featureKey: feature,
      }),
    );
  }

  /**
   * Resolve the caller's full feature→decision map via the package. This is the
   * shape the API caches per user (short TTL, invalidated on
   * `entitlement.changed`, §6.2) and is the single matrix the package owns.
   */
  async resolveMap(auth: AuthContext): Promise<EntitlementMap> {
    const snapshot = await this.loadSubscription(auth);
    return resolveEntitlements(snapshot.plan, snapshot.status);
  }

  /**
   * Load the caller's plan + subscription status from `subscriptions` (joined to
   * `plans` for the tier), scoped to the caller's org by RLS via the tenant GUC.
   * Returns the conservative default when the caller has no subscription row, so
   * nothing paid is granted by accident.
   *
   * Requires `DATABASE_URL` to be configured; a short-TTL Redis cache keyed on
   * (user, org) and invalidated on `entitlement.changed` is a later optimization
   * and not the authority.
   */
  private async loadSubscription(
    auth: AuthContext,
  ): Promise<SubscriptionSnapshot> {
    const row = await this.tenantDb.run(auth, async (tx) => {
      const result = await tx
        .select({ tier: plans.tier, status: subscriptions.status })
        .from(subscriptions)
        .innerJoin(users, eq(users.id, subscriptions.userId))
        .leftJoin(plans, eq(plans.id, subscriptions.planId))
        .where(
          and(
            eq(users.authUserId, auth.sub),
            eq(subscriptions.orgId, auth.orgId),
          ),
        )
        .limit(1);
      return result[0];
    });

    if (!row) {
      return DEFAULT_SNAPSHOT;
    }

    return {
      plan: EntitlementsService.toPlan(row.tier),
      status: EntitlementsService.toStatus(row.status),
    };
  }

  /**
   * Map the DB `plan_tier` enum to the package `Plan`. `partner_license` is not
   * a member-facing plan in the package vocabulary, so it falls back to `basic`
   * (org-level licenses are modeled as explicit entitlement rows elsewhere).
   */
  private static toPlan(tier: string | null | undefined): Plan {
    if (tier === 'pro' || tier === 'elite' || tier === 'basic') {
      return tier;
    }
    return 'basic';
  }

  /**
   * Map the DB `subscription_status` enum to the package `SubscriptionStatus`.
   * The DB has one extra value (`incomplete_expired`) the package folds into
   * `incomplete`; everything else is identical.
   */
  private static toStatus(status: string): SubscriptionStatus {
    switch (status) {
      case 'active':
      case 'trialing':
      case 'past_due':
      case 'canceled':
      case 'incomplete':
      case 'unpaid':
      case 'paused':
        return status;
      case 'incomplete_expired':
        return 'incomplete';
      default:
        return 'incomplete';
    }
  }
}
