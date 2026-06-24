import { Module } from '@nestjs/common';
import { EntitlementsController } from './entitlements.controller';
import { EntitlementsService } from './entitlements.service';
import { EntitlementGuard } from './entitlement.guard';
import { LocalEntitlementDecider } from './local-entitlement-decider';
import { ENTITLEMENT_DECIDER } from './entitlement.types';

/**
 * Entitlements module. Binds the pure decider behind its DI token, exposes the
 * orchestrating service + route guard, and serves GET /entitlements.
 *
 * The decider provider is the single swap point for @fxunlock/entitlements.
 */
@Module({
  controllers: [EntitlementsController],
  providers: [
    { provide: ENTITLEMENT_DECIDER, useClass: LocalEntitlementDecider },
    EntitlementsService,
    EntitlementGuard,
  ],
  exports: [EntitlementsService, EntitlementGuard],
})
export class EntitlementsModule {}
