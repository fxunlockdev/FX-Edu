import type { Database } from '@fxunlock/db';

/**
 * DI token for the singleton Drizzle client bound to the full FX Academy schema
 * (`@fxunlock/db`). Inject it where you need raw query access; prefer the
 * {@link TenantDbService} for any tenant-scoped read/write so RLS is enforced.
 */
export const DB = 'FX_DB';

/** The injected client type, re-exported so call sites need one import. */
export type Db = Database;
