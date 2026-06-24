import { SetMetadata } from '@nestjs/common';
import type { FeatureKey } from './entitlement.types';

export const ENTITLEMENT_KEY = 'fx:entitlement';

/**
 * Declares the feature a route requires. Enforced by EntitlementGuard, which
 * loads the caller's subscription and runs the pure decider. Server-side gate —
 * UI locks are hints only.
 */
export const RequireEntitlement = (
  feature: FeatureKey,
): MethodDecorator & ClassDecorator => SetMetadata(ENTITLEMENT_KEY, feature);
