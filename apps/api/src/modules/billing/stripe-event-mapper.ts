import type Stripe from 'stripe';
import type { EntitlementUpdate } from './entitlement-writer.types';
import type { Plan, SubscriptionStatus } from '../entitlements/entitlement.types';

/**
 * Pure mapper: Stripe subscription event → EntitlementUpdate (or null if the
 * event is not entitlement-relevant). No I/O, so it is trivially unit-testable.
 *
 * Covers the lifecycle the PRD calls out (§10 key events): subscription
 * created/updated/past_due/cancelled. `past_due` and `canceled` flip access to a
 * non-active status; the pure decider then locks gated features.
 */
export function mapStripeEventToUpdate(
  event: Stripe.Event,
): EntitlementUpdate | null {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      return {
        stripeCustomerId: customerId(subscription.customer),
        plan: planFromSubscription(subscription),
        status: mapStatus(subscription.status),
        sourceEventId: event.id,
      };
    }
    default:
      return null;
  }
}

function customerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer): string {
  return typeof customer === 'string' ? customer : customer.id;
}

/**
 * Derive our internal plan from the subscription's price metadata.
 *
 * TODO: wire @fxunlock/db — map Stripe price ids to plans via the `plans` table
 * rather than reading a metadata convention. Until then we read a `plan` key off
 * the price metadata and default conservatively to Basic.
 */
function planFromSubscription(subscription: Stripe.Subscription): Plan {
  const price = subscription.items.data[0]?.price;
  const metaPlan = price?.metadata?.['plan'];
  if (metaPlan === 'pro' || metaPlan === 'elite' || metaPlan === 'basic') {
    return metaPlan;
  }
  return 'basic';
}

/** Map Stripe's subscription status to our internal status vocabulary. */
function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'incomplete';
    default:
      return 'none';
  }
}
