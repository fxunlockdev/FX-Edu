import { Module } from '@nestjs/common';
import { EntitlementsController } from './entitlements.controller';
import { EntitlementsService } from './entitlements.service';
import { EntitlementGuard } from './entitlement.guard';
import { PackageEntitlementDecider } from './package-entitlement-decider';
import { ENTITLEMENT_DECIDER } from './entitlement.types';

/**
 * Entitlements module. Binds the package-backed decider behind its DI token,
 * exposes the orchestrating service + route guard, and serves GET /entitlements.
 *
 * The decider provider is the single DI seam over `@fxunlock/entitlements` — the
 * package owns the policy; this binding is just the adapter. `TenantDbService`
 * is provided globally by DbModule and injected by EntitlementsService.
 */
@Module({
  controllers: [EntitlementsController],
  providers: [
    { provide: ENTITLEMENT_DECIDER, useClass: PackageEntitlementDecider },
    EntitlementsService,
    EntitlementGuard,
  ],
  exports: [EntitlementsService, EntitlementGuard],
})
export class EntitlementsModule {}
