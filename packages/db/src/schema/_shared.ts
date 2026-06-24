/**
 * Shared building blocks for every schema domain.
 *
 * Conventions enforced here (see PROJECT.md §10 and ENGINEERING.md):
 *  - Every table has `id uuid default gen_random_uuid()` (pgcrypto).
 *  - Every table has `created_at` / `updated_at` timestamptz.
 *  - Tenant-scoped tables carry `org_id uuid` → organizations(id) and get RLS.
 *  - Soft-delete (`deleted_at`) is added only where audit retention requires it
 *    (community + moderated content) — not globally.
 *
 * These helpers are spread into table definitions so the columns stay identical
 * everywhere and the intent is declared once.
 */
import { sql } from "drizzle-orm";
import {
  customType,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * pgvector `vector(n)` column type.
 *
 * Drizzle has no first-class vector type, so we declare a custom type that maps
 * to `vector(dimensions)`. Default dimension is 1536 (OpenAI text-embedding-3
 * / Bedrock Titan v2 compatible); callers pass an explicit dimension per table.
 * The pgvector extension is enabled in `policies/enable-extensions.sql`.
 */
export const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    const dimensions = config?.dimensions ?? 1536;
    return `vector(${dimensions})`;
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    return value
      .slice(1, -1)
      .split(",")
      .filter((part) => part.length > 0)
      .map((part) => Number(part));
  },
});

/**
 * Timestamp columns present on every table. `updated_at` defaults to now() and
 * is kept fresh by the API layer (and a DB trigger documented in policies).
 */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

/**
 * Soft-delete column. Added ONLY to community + moderated content so the audit
 * trail survives a "delete" (PROJECT.md §10, §8.11 acceptance criteria).
 */
export const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

/**
 * Primary key shared by every table.
 */
export const primaryKey = {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
};

/**
 * Convenience: the full common column set for a NON-tenant-scoped table
 * (global/system tables such as plans, feature_flags, market_quotes).
 */
export const baseColumns = {
  ...primaryKey,
  ...timestamps,
};
