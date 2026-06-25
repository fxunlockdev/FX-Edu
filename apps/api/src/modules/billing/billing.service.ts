import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { and, eq } from 'drizzle-orm';
import { plans, subscriptions, users, type Database } from '@fxunlock/db';
import type { Plan } from '@fxunlock/entitlements';
import { ConfigService } from '../../config/config.service';
import type { AuthContext } from '../../common/auth/auth-context';
import { STRIPE_CLIENT } from './stripe.provider';
import { IDEMPOTENCY_STORE, type IdempotencyStore } from './idempotency.types';
import {
  ENTITLEMENT_WRITER,
  type EntitlementWriter,
} from './entitlement-writer.types';
import {
  mapStripeEvent,
  type MappedSubscriptionEvent,
} from './stripe-event-mapper';
import { DB } from '../db/db.tokens';
import { TenantDbService } from '../db/tenant-db.service';
import { isSteppedUp } from './step-up';

/** Plan tiers we accept from the `plans` table (review HIGH-4 allowlist). */
const ALLOWED_PLANS: ReadonlySet<Plan> = new Set<Plan>(['basic', 'pro', 'elite']);

/** Type guard: is a DB plan tier one of the allowlisted member plans? */
function isAllowedPlan(tier: string): tier is Plan {
  return ALLOWED_PLANS.has(tier as Plan);
}

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
    private readonly tenantDb: TenantDbService,
    @Inject(DB) private readonly db: Database,
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

    const mapped = mapStripeEvent(event);
    let handled = false;
    if (mapped) {
      handled = await this.applyMappedEvent(mapped, event.type);
    } else {
      this.logger.debug({ type: event.type }, 'unmapped stripe event ignored');
    }

    await this.idempotency.remember(event.id);
    return { received: true, handled };
  }

  /**
   * Resolve the plan from the `plans` table (allowlisted) and apply the
   * entitlement update. On an unknown/disallowed price we log a structured
   * warning and do NOT act (review HIGH-4 — never silently default to a plan).
   */
  private async applyMappedEvent(
    mapped: MappedSubscriptionEvent,
    eventType: string,
  ): Promise<boolean> {
    const plan = await this.resolvePlan(mapped.stripePriceId);
    if (!plan) {
      this.logger.warn(
        {
          event: 'billing.unknown_price',
          eventType,
          stripePriceId: mapped.stripePriceId,
          stripeCustomerId: mapped.stripeCustomerId,
          sourceEventId: mapped.sourceEventId,
        },
        'Stripe price not mapped to an allowlisted plan; entitlement update skipped.',
      );
      return false;
    }

    await this.entitlementWriter.apply({
      stripeCustomerId: mapped.stripeCustomerId,
      plan,
      status: mapped.status,
      sourceEventId: mapped.sourceEventId,
    });
    return true;
  }

  /**
   * Map a Stripe Price id to one of our plans via the global `plans` table,
   * filtered by the allowlist. Returns null for a missing/null price id or a
   * tier outside the allowlist (e.g. `partner_license`) — the caller treats
   * null as "do not act" rather than defaulting.
   */
  private async resolvePlan(
    stripePriceId: string | null,
  ): Promise<Plan | null> {
    if (!stripePriceId) {
      return null;
    }
    const rows = await this.db
      .select({ tier: plans.tier })
      .from(plans)
      .where(and(eq(plans.stripePriceId, stripePriceId), eq(plans.active, true)))
      .limit(1);
    const tier = rows[0]?.tier;
    return tier !== undefined && isAllowedPlan(tier) ? tier : null;
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
   * Create a Stripe Customer Portal session for self-service billing (§16).
   *
   * Two server-side gates (resolve review HIGH-3 + CRITICAL-1 follow-through):
   *  1. Step-up auth: billing changes require a fresh MFA factor (`aal2`/`amr`,
   *     §6.1). A non-stepped-up caller gets a 403.
   *  2. The Stripe customer id is resolved from the caller's own `subscriptions`
   *     row (RLS-scoped to their org) — NEVER from the client. No row → 404.
   */
  async createPortalSession(
    user: AuthContext,
    returnUrl: string,
  ): Promise<{ url: string }> {
    if (!isSteppedUp(user)) {
      // Designed step-up prompt on the client; server refuses outright.
      throw new ForbiddenException({
        message: 'Billing changes require re-authentication (MFA step-up).',
        code: 'step_up_required',
      });
    }

    const stripeCustomerId = await this.resolveStripeCustomerId(user);
    if (!stripeCustomerId) {
      throw new NotFoundException('No subscription found for this account.');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }

  /**
   * Resolve the caller's Stripe customer id from their own subscription row,
   * scoped to their org by RLS via the tenant GUC. Returns null when the caller
   * has no subscription. The id is sourced server-side only (review CRITICAL-1).
   */
  private async resolveStripeCustomerId(
    user: AuthContext,
  ): Promise<string | null> {
    const row = await this.tenantDb.run(user, async (tx) => {
      const result = await tx
        .select({ stripeCustomerId: subscriptions.stripeCustomerId })
        .from(subscriptions)
        .innerJoin(users, eq(users.id, subscriptions.userId))
        .where(
          and(
            eq(users.authUserId, user.sub),
            eq(subscriptions.orgId, user.orgId),
          ),
        )
        .limit(1);
      return result[0];
    });
    return row?.stripeCustomerId ?? null;
  }
}
