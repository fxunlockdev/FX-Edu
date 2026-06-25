import { Logger, type Provider } from '@nestjs/common';
import { createDb, type Database } from '@fxunlock/db';
import { ConfigService } from '../../config/config.service';
import { DB } from './db.tokens';

/**
 * Provides the singleton Drizzle client.
 *
 * The connection string comes only from validated config (`DATABASE_URL`, see
 * env.schema.ts) — never hardcoded. `createDb` opens a small postgres-js pool
 * with `prepare: false` (Supabase transaction-pooler friendly). A real
 * connection requires `DATABASE_URL` to point at the Supabase Postgres instance;
 * with no reachable DB the pool is lazy and the first query is what fails.
 *
 * The API connects as a non-superuser role; every tenant-scoped query must run
 * through {@link TenantDbService} so the `app.current_org` GUC is set and RLS
 * scopes statements to the caller's org (PROJECT.md §6.1 two-layer authz).
 */
export const dbProvider: Provider = {
  provide: DB,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Database => {
    const logger = new Logger('Db');
    const client = createDb({ connectionString: config.databaseUrl });
    logger.log(
      'Drizzle client initialised (DATABASE_URL configured; connection is lazy).',
    );
    return client;
  },
};
