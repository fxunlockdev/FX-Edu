import type { Plan, SubscriptionStatus } from '@fxunlock/entitlements';

/**
 * Command to update a customer's subscription/entitlement state from a verified
 * Stripe event. Stripe is the source of truth (§6.2); this is how billing tells
 * the entitlements layer what changed.
 */
export interface EntitlementUpdate {
  readonly stripeCustomerId: string;
  readonly plan: Plan;
  readonly status: SubscriptionStatus;
  /** Stripe event id, for idempotent persistence + audit traceability. */
  readonly sourceEventId: string;
}

/**
 * Write boundary for entitlement changes. Billing depends on this interface;
 * the implementation will write `subscriptions` + `entitlements` and emit the
 * `entitlement.changed` event that invalidates the Redis cache.
 */
export interface EntitlementWriter {
  apply(update: EntitlementUpdate): Promise<void>;
}

export const ENTITLEMENT_WRITER = 'FX_ENTITLEMENT_WRITER';
