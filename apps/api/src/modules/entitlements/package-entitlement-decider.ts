import { Injectable } from '@nestjs/common';
import { canAccessFeature, type Decision } from '@fxunlock/entitlements';
import {
  type EntitlementContext,
  type EntitlementDecider,
  type EntitlementDecision,
} from './entitlement.types';

/**
 * Production entitlement decider — a thin adapter over `@fxunlock/entitlements`.
 *
 * It holds NO policy of its own (resolves review CRITICAL-4 + HIGH-2: there is
 * exactly one plan→feature matrix, and it lives in the package). It calls the
 * package's pure, total `canAccessFeature` and wraps the resulting `Decision`
 * in the API's {@link EntitlementDecision} envelope with a machine-readable
 * reason for guards/clients.
 */
@Injectable()
export class PackageEntitlementDecider implements EntitlementDecider {
  decide(context: EntitlementContext): EntitlementDecision {
    const outcome = canAccessFeature(context);
    return {
      outcome,
      feature: context.featureKey,
      reason: PackageEntitlementDecider.reasonFor(outcome, context),
    };
  }

  /** Human/machine-readable reason mirroring the package's decision branches. */
  private static reasonFor(
    outcome: Decision,
    context: EntitlementContext,
  ): string {
    switch (outcome) {
      case 'allow':
        return 'entitled';
      case 'locked':
        return `requires_upgrade:${context.featureKey}`;
      case 'deny':
        return `denied:${context.subscriptionStatus}`;
    }
  }
}
