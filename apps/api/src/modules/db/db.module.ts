import { Global, Module } from '@nestjs/common';
import { dbProvider } from './db.provider';
import { TenantDbService } from './tenant-db.service';

/**
 * Database module.
 *
 * Provides the singleton Drizzle client (`@fxunlock/db`) behind the {@link DB}
 * token and the {@link TenantDbService} request helper that runs tenant-scoped
 * queries under the caller's org GUC for RLS. Marked @Global so feature modules
 * (billing, entitlements) inject these without re-importing.
 *
 * Runtime requirement: `DATABASE_URL` must be set to the Supabase Postgres
 * connection string. The client is created eagerly but connects lazily, so the
 * module boots without a reachable DB; the first query is where a misconfigured
 * URL surfaces.
 */
@Global()
@Module({
  providers: [dbProvider, TenantDbService],
  exports: [dbProvider, TenantDbService],
})
export class DbModule {}
