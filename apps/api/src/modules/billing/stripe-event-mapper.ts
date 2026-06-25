import type Stripe from 'stripe';
import type { SubscriptionStatus } from '@fxunlock/entitlements';

/**
 * Pure mapper: Stripe subscription event → a normalized, plan-agnostic shape
 * (or null if the event is not entitlement-relevant). No I/O, so it is trivially
 * unit-testable.
 *
 * Plan resolution is intentionally NOT done here: mapping a Stripe price to our
 * plan must consult the `plans` table (DB) with an allowlist (resolves review
 * HIGH-4 — no silent metadata default), which is I/O. The mapper surfaces the
 * `stripePriceId`; BillingService resolves the plan and decides whether to act.
 *
 * Covers the lifecycle the PRD calls out (§10 key events): subscription
 * created/updated/deleted. `past_due`/`canceled`/`paused` flip access to a
 * non-active status; the pure decider then locks gated features.
 */
export interface MappedSubscriptionEvent {
  readonly stripeCustomerId: string;
  /** Stripe Price id; resolved to a plan against the `plans` table downstream. */
  readonly stripePriceId: string | null;
  readonly status: SubscriptionStatus;
  /** Stripe event id, for idempotent persistence + audit traceability. */
  readonly sourceEventId: string;
}

export function mapStripeEvent(
  event: Stripe.Event,
): MappedSubscriptionEvent | null {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      return {
        stripeCustomerId: customerId(subscription.customer),
        stripePriceId: priceId(subscription),
        status: mapStatus(subscription.status),
        sourceEventId: event.id,
      };
    }
    default:
      return null;
  }
}

function customerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer,
): string {
  return typeof customer === 'string' ? customer : customer.id;
}

/** The Stripe Price id on the subscription's first line item, if present. */
function priceId(subscription: Stripe.Subscription): string | null {
  return subscription.items.data[0]?.price?.id ?? null;
}

/** Map Stripe's subscription status to the package's status vocabulary. */
function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'unpaid':
      return 'unpaid';
    case 'canceled':
      return 'canceled';
    case 'paused':
      return 'paused';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    default:
      return 'incomplete';
  }
}
