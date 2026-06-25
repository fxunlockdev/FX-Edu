/**
 * Entitlement contract for the API.
 *
 * The single source of truth for entitlement *vocabulary* and *policy* is the
 * pure, unit-tested `@fxunlock/entitlements` package (PROJECT.md §6.2 — "no
 * I/O"). This module re-exports the package's types so the rest of the API
 * speaks one vocabulary (resolves review CRITICAL-4 + HIGH-2 — the local
 * duplicate enums are gone) and defines a thin DI seam (`EntitlementDecider`)
 * that is *backed by* the package, keeping the swap point the module advertises.
 */
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
} from '@fxunlock/entitlements';

import type {
  Decision,
  EntitlementContext,
  FeatureKey,
} from '@fxunlock/entitlements';

/**
 * The resolved outcome the API returns to callers for a single feature.
 *
 * Wraps the package's pure {@link Decision} with the feature it was decided for
 * and a short machine-readable reason, so guards can build a 403 body and the
 * GET /entitlements response can be rendered without re-deriving anything.
 */
export interface EntitlementDecision {
  readonly outcome: Decision;
  readonly feature: FeatureKey;
  readonly reason: string;
}

/**
 * Decision boundary the guard and services depend on. The DI seam is preserved
 * (so tests can substitute a fake), but the production binding delegates to the
 * package's pure `canAccessFeature` — the package is the policy, this is the
 * adapter.
 */
export interface EntitlementDecider {
  decide(context: EntitlementContext): EntitlementDecision;
}

export const ENTITLEMENT_DECIDER = 'FX_ENTITLEMENT_DECIDER';
