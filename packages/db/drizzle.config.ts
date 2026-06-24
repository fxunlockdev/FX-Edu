import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration for FX Academy.
 *
 * - Dialect is Postgres (Supabase Postgres 17, region `eu-north-1` / Stockholm).
 * - Schema is split across `src/schema/*.ts` and re-exported from the barrel.
 * - Generated SQL migrations live in `./drizzle` and are versioned in git.
 * - RLS policies and extension bootstrap live in `src/policies/*.sql` and are
 *   applied AFTER the generated table migrations (see README "Migrations").
 *
 * The connection string is read from the environment and is never hardcoded.
 * In CI/local it is `DATABASE_URL`; per-environment values come from Doppler.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  // Drizzle Kit reads this lazily; the API/workers connect with their own
  // runtime client (see `src/client.ts`). No secret is ever inlined here.
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  // pgvector + enums are managed by us; keep introspection strict.
  strict: true,
  verbose: true,
  // Only diff the `public` schema; our helper functions live in the `app`
  // schema (created by policies SQL) and are intentionally outside Drizzle.
  schemaFilter: ["public"],
});
