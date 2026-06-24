/**
 * Runtime database client.
 *
 * Two connection roles, both EU-pinned (Supabase `eu-north-1`):
 *
 *  1. The NestJS API connects as an *authenticated* (non-superuser) role and,
 *     per request, sets the session GUCs `app.current_org` / `app.current_role`
 *     inside a transaction. RLS policies read these via
 *     `current_setting('app.current_org', true)` (see src/policies/). This is
 *     the primary, defence-in-depth path.
 *
 *  2. Supabase client paths (edge/Realtime) authenticate with the user JWT and
 *     RLS reads `auth.jwt()->>'org_id'` natively — no GUC needed.
 *
 * The connection string is read from the environment (never hardcoded). Callers
 * validate `DATABASE_URL` with their own Zod env schema (`@fxunlock/config`);
 * here we only fail fast if it is missing.
 */
import { sql } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema/index.js";

/** The Drizzle database bound to the full FX Academy schema. */
export type Database = PostgresJsDatabase<typeof schema>;

/** A transaction handle carrying the same typed query surface as `Database`. */
export type Transaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];

export interface DbConfig {
  /** Postgres connection string (validated upstream). */
  readonly connectionString: string;
  /** Max pool size; keep small on serverless/edge. */
  readonly maxConnections?: number;
}

/**
 * Create a Drizzle client bound to the full schema. Immutable config in,
 * a ready client out — no module-level singletons or hidden globals.
 */
export function createDb(config: DbConfig): Database {
  if (!config.connectionString) {
    throw new Error(
      "[@fxunlock/db] connectionString is required (set DATABASE_URL).",
    );
  }
  const client = postgres(config.connectionString, {
    max: config.maxConnections ?? 10,
    prepare: false, // friendlier to Supabase's transaction pooler
  });
  return drizzle(client, { schema });
}

/** Tenant context applied per request before any tenant-scoped query. */
export interface TenantContext {
  readonly orgId: string;
  readonly role: string;
  readonly userId?: string;
}

/**
 * Run `work` inside a transaction with the per-request tenant GUCs set, so RLS
 * policies that read `current_setting('app.current_org', true)` scope every
 * statement to the caller's org. Uses `set_config(..., true)` (transaction-local)
 * so the setting never leaks across pooled connections.
 *
 * The transaction handle passed to `work` keeps full, typed query access.
 */
export async function withTenant<T>(
  db: Database,
  ctx: TenantContext,
  work: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.current_org', ${ctx.orgId}, true)`,
    );
    await tx.execute(
      sql`select set_config('app.current_role', ${ctx.role}, true)`,
    );
    if (ctx.userId) {
      await tx.execute(
        sql`select set_config('app.current_user', ${ctx.userId}, true)`,
      );
    }
    return work(tx);
  });
}

export { schema };
