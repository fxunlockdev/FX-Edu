-- ============================================================================
-- 00_helpers.sql
-- ----------------------------------------------------------------------------
-- Shared SQL helpers used by the RLS policies and by maintenance triggers.
-- Run AFTER enable-extensions.sql and AFTER the generated table migration,
-- BEFORE the rls/*.sql policy files.
--
-- Tenancy context (two interchangeable sources — see README "RLS / tenancy"):
--   * API path:      current_setting('app.current_org', true)   (a GUC the
--                    NestJS API sets per request inside a transaction)
--   * Supabase path: auth.jwt() ->> 'org_id'                     (native claim)
--
-- `app.current_org()` resolves the effective org from EITHER source so a single
-- policy expression works for both connection roles. `true` as the second arg to
-- current_setting() means "missing setting -> NULL" instead of raising.
-- ============================================================================

-- Dedicated schema for our helper functions, kept out of `public`.
create schema if not exists app;

-- Effective tenant org for the current request.
create or replace function app.current_org()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('app.current_org', true), ''),
    -- Supabase native path: org_id stamped into the JWT by the claims hook.
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'org_id', '')
  )::uuid;
$$;

-- Effective role for the current request (member/educator/admin/owner/...).
create or replace function app.current_role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('app.current_role', true), ''),
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '')
  );
$$;

-- Effective user id for the current request (used for user-owned row scoping).
create or replace function app.current_user_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('app.current_user', true), ''),
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')
  )::uuid;
$$;

-- True when the caller is an org-level admin/owner (broader read within org).
create or replace function app.is_org_admin()
returns boolean
language sql
stable
as $$
  select app.current_role() in ('admin', 'owner');
$$;

-- ----------------------------------------------------------------------------
-- updated_at trigger: keep `updated_at` fresh on every UPDATE without relying
-- on the application remembering to set it.
-- ----------------------------------------------------------------------------
create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- NOTE: per-table `create trigger ... execute function app.set_updated_at()`
-- statements are emitted alongside the RLS files (one per table). They are
-- omitted here to keep this file focused on shared definitions.
