-- ============================================================================
-- 02_rls_global.sql
-- ----------------------------------------------------------------------------
-- RLS for GLOBAL (non-tenant) tables — those WITHOUT an `org_id`.
-- Run AFTER 01_rls_tenant.sql.
--
-- Two categories:
--   A. Public-read cached provider data (market_quotes, news_items): readable
--      by any authenticated caller, writable by service-role only.
--   B. Infrastructure (plans, feature_flags, idempotency_keys, event_outbox):
--      service-role only. We FORCE RLS with no permissive policy so ordinary
--      authenticated roles see zero rows; the NestJS workers/handlers connect
--      with the service role (which bypasses RLS) for these.
--
-- The `service_role` (Supabase) / table-owner connection bypasses RLS, so the
-- API's privileged paths and workers operate unrestricted on these tables.
-- ============================================================================

-- ---- A. Public-read cached provider data --------------------------------

alter table market_quotes enable row level security;
alter table market_quotes force row level security;
-- Educational market context: any authenticated caller may read.
create policy market_quotes_public_read on market_quotes
  for select
  using (true);

alter table news_items enable row level security;
alter table news_items force row level security;
create policy news_items_public_read on news_items
  for select
  using (true);

-- ---- B. Service-role-only infrastructure --------------------------------
-- Enable + force RLS, intentionally WITHOUT a permissive policy. Authenticated
-- roles get no rows; service-role bypasses RLS entirely.

alter table plans enable row level security;
alter table plans force row level security;
-- Plans are a public catalog: allow authenticated read (pricing pages, upgrade
-- modals) but no writes outside service-role.
create policy plans_public_read on plans
  for select
  using (true);

alter table feature_flags enable row level security;
alter table feature_flags force row level security;
-- No policy: only service-role (RLS-bypassing) connections read/write flags.

alter table idempotency_keys enable row level security;
alter table idempotency_keys force row level security;
-- No policy: webhook/payment dedupe is service-role only.

alter table event_outbox enable row level security;
alter table event_outbox force row level security;
-- No policy: the transactional outbox is written by handlers and drained by the
-- pg-queue publisher, both service-role.
