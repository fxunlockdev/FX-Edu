import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { stripeProvider } from './stripe.provider';
import { InMemoryIdempotencyStore } from './in-memory-idempotency.store';
import { PostgresIdempotencyStore } from './postgres-idempotency.store';
import { idempotencyStoreProvider } from './idempotency.provider';
import { ENTITLEMENT_WRITER } from './entitlement-writer.types';
import { StubEntitlementWriter } from './stub-entitlement-writer';

/**
 * Billing module. Wires the Stripe client and the two swappable boundaries —
 * idempotency store and entitlement writer — behind their DI tokens.
 *
 * The idempotency store is selected by `idempotencyStoreProvider`: durable
 * Postgres by default (resolves review CRITICAL-2), with a dev/test in-memory
 * fallback that is rejected in production. The `DB`/`TenantDbService` deps are
 * provided globally by DbModule.
 */
@Module({
  controllers: [BillingController],
  providers: [
    BillingService,
    stripeProvider,
    PostgresIdempotencyStore,
    InMemoryIdempotencyStore,
    idempotencyStoreProvider,
    { provide: ENTITLEMENT_WRITER, useClass: StubEntitlementWriter },
  ],
})
export class BillingModule {}
