import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '../../config/config.service';
import type { AuthContext } from '../../common/auth/auth-context';
import { STRIPE_CLIENT } from './stripe.provider';
import { IDEMPOTENCY_STORE, type IdempotencyStore } from './idempotency.types';
import {
  ENTITLEMENT_WRITER,
  type EntitlementWriter,
} from './entitlement-writer.types';
import { mapStripeEventToUpdate } from './stripe-event-mapper';

interface WebhookResult {
  readonly received: true;
  readonly handled: boolean;
}

/**
 * Stripe webhook + portal logic.
 *
 * Webhooks are the source of truth for subscription state (§6.2). We:
 *  1. verify the signature against the RAW request body (tamper-proof),
 *  2. drop replays via the idempotency store (event id),
 *  3. map subscription lifecycle events → an entitlement update.
 *
 * A verification failure is a 400 with no internals leaked; an unmapped event is
 * acknowledged (200) but not acted on, so Stripe stops retrying.
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly config: ConfigService,
    @Inject(IDEMPOTENCY_STORE)
    private readonly idempotency: IdempotencyStore,
    @Inject(ENTITLEMENT_WRITER)
    private readonly entitlementWriter: EntitlementWriter,
  ) {}

  async handleWebhook(
    rawBody: Buffer,
    signature: string | undefined,
  ): Promise<WebhookResult> {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature.');
    }

    const event = this.verify(rawBody, signature);

    if (await this.idempotency.seen(event.id)) {
      // Replayed event — no-op (idempotent webhooks).
      return { received: true, handled: false };
    }

    const update = mapStripeEventToUpdate(event);
    if (update) {
      await this.entitlementWriter.apply(update);
    } else {
      this.logger.debug({ type: event.type }, 'unmapped stripe event ignored');
    }

    await this.idempotency.remember(event.id);
    return { received: true, handled: update !== null };
  }

  private verify(rawBody: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.config.stripeWebhookSecret,
      );
    } catch {
      // Signature mismatch / malformed payload — never echo details.
      throw new BadRequestException('Invalid Stripe webhook signature.');
    }
  }

  /**
   * Create a Stripe Customer Portal session for self-service billing (§8.15).
   *
   * TODO: wire @fxunlock/db — resolve the caller's Stripe customer id from
   * `subscriptions` (RLS-scoped) instead of trusting a client-supplied id, and
   * gate behind step-up auth (§6.1) before returning a portal URL.
   */
  async createPortalSession(
    _user: AuthContext,
    _returnUrl: string,
  ): Promise<{ url: string }> {
    // SECURITY (review CRITICAL-1): never open a portal from a client-supplied
    // customer id — that exposes any customer's billing portal. Disabled until
    // @fxunlock/db resolves the caller's Stripe customer id from `subscriptions`
    // (RLS-scoped) and step-up auth (§6.1) is enforced.
    throw new NotImplementedException(
      'Self-service billing portal is not yet enabled.',
    );
  }
}
