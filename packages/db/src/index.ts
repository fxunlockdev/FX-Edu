/**
 * @fxunlock/db — public surface.
 *
 * Exports:
 *  - the full Drizzle schema (tables, enums, relations) and the pgvector
 *    `vector` type via the schema barrel;
 *  - drizzle-zod insert/select validation contracts (co-located per domain);
 *  - the runtime client factory + per-request tenant helper.
 *
 * RLS policies and the extension bootstrap live as versioned SQL in
 * `src/policies/` and are applied during migration (see README).
 */
export * from "./schema/index.js";
export {
  createDb,
  withTenant,
  schema,
  type Database,
  type DbConfig,
  type TenantContext,
} from "./client.js";
