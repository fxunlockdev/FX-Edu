import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { stripeProvider } from './stripe.provider';
import { IDEMPOTENCY_STORE } from './idempotency.types';
import { InMemoryIdempotencyStore } from './in-memory-idempotency.store';
import { ENTITLEMENT_WRITER } from './entitlement-writer.types';
import { StubEntitlementWriter } from './stub-entitlement-writer';

/**
 * Billing module. Wires the Stripe client and the two swappable boundaries —
 * idempotency store and entitlement writer — behind their DI tokens. Each is the
 * single point to wire Redis / @fxunlock/db later.
 */
@Module({
  controllers: [BillingController],
  providers: [
    BillingService,
    stripeProvider,
    { provide: IDEMPOTENCY_STORE, useClass: InMemoryIdempotencyStore },
    { provide: ENTITLEMENT_WRITER, useClass: StubEntitlementWriter },
  ],
})
export class BillingModule {}
