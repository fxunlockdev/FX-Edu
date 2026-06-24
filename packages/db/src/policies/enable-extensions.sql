-- ============================================================================
-- enable-extensions.sql
-- ----------------------------------------------------------------------------
-- Bootstrap extensions FX Academy depends on. Run this FIRST — before the
-- generated Drizzle table migration and before any RLS policy file — because:
--   * pgcrypto provides gen_random_uuid() used by every table's `id` default;
--   * vector (pgvector) provides the `vector` column type used by course_chunks.
--
-- On Supabase these extensions are available; we install them into the
-- `extensions` schema where Supabase keeps them, but expose the functions on
-- the search_path so `gen_random_uuid()` resolves unqualified in defaults.
--
-- Idempotent: safe to run on every migrate.
-- ============================================================================

-- UUIDs + crypto helpers (gen_random_uuid, digest, etc.)
create extension if not exists pgcrypto;

-- pgvector for AI retrieval embeddings (course_chunks.embedding)
create extension if not exists vector;

-- Optional but recommended on Supabase for case-insensitive text / trigram
-- search on lessons/courses; harmless if already present.
create extension if not exists pg_trgm;
