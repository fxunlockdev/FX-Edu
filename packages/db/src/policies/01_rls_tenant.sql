-- ============================================================================
-- 01_rls_tenant.sql
-- ----------------------------------------------------------------------------
-- Row-Level Security for EVERY tenant-scoped table (those carrying `org_id`).
-- Run AFTER 00_helpers.sql.
--
-- The canonical tenant predicate is:
--     org_id = app.current_org()
-- where app.current_org() resolves the org from EITHER the API GUC
-- (`app.current_org`) OR the Supabase JWT claim (`auth.jwt()->>'org_id'`).
--
-- For each table we:
--   1. enable + force RLS (FORCE makes it apply even to the table owner);
--   2. add a permissive policy for all commands scoped to the caller's org;
--   3. additionally constrain user-owned tables to the caller's own rows
--      (admins/owners of the org may read across users within their org).
--
-- Supabase-native variant (documented, equivalent): replace the USING clause
-- with `org_id = (auth.jwt() ->> 'org_id')::uuid`. We use app.current_org()
-- because it transparently covers both paths in one expression.
--
-- This file is intentionally explicit (one block per table) so a reviewer can
-- see isolation is applied everywhere; the CI cross-tenant test (F3) asserts it.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper: a do-block macro would be cleaner, but explicit statements keep the
-- generated diff auditable. Pattern repeated per table below.
-- ---------------------------------------------------------------------------

-- ============================ auth domain ==================================

-- organizations: a caller may only see their own org row(s). (The system org
-- is readable only by service-role connections, which bypass RLS.)
alter table organizations enable row level security;
alter table organizations force row level security;
create policy organizations_tenant_isolation on organizations
  using (id = app.current_org());

alter table memberships enable row level security;
alter table memberships force row level security;
create policy memberships_tenant_isolation on memberships
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

-- users / profiles are NOT org-scoped columns directly, but a user is reachable
-- through their membership in the caller's org. We scope users to "self OR a
-- member of the caller's org" and let org admins read members of their org.
alter table users enable row level security;
alter table users force row level security;
create policy users_self_or_org on users
  using (
    id = app.current_user_id()
    or exists (
      select 1 from memberships m
      where m.user_id = users.id
        and m.org_id = app.current_org()
    )
  );

alter table profiles enable row level security;
alter table profiles force row level security;
create policy profiles_self_or_org on profiles
  using (
    user_id = app.current_user_id()
    or (
      app.is_org_admin()
      and exists (
        select 1 from memberships m
        where m.user_id = profiles.user_id
          and m.org_id = app.current_org()
      )
    )
  );

-- ============================ billing domain ===============================

alter table subscriptions enable row level security;
alter table subscriptions force row level security;
create policy subscriptions_tenant_isolation on subscriptions
  using (
    org_id = app.current_org()
    and (user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (org_id = app.current_org());

alter table entitlements enable row level security;
alter table entitlements force row level security;
create policy entitlements_tenant_isolation on entitlements
  using (
    org_id = app.current_org()
    and (
      user_id is null
      or user_id = app.current_user_id()
      or app.is_org_admin()
    )
  )
  with check (org_id = app.current_org());

-- ============================ learning domain ==============================
-- Content tables: any member of the org may read; writes happen via service or
-- educator/admin role (enforced additionally in the API policy guard).

alter table courses enable row level security;
alter table courses force row level security;
create policy courses_tenant_isolation on courses
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

alter table modules enable row level security;
alter table modules force row level security;
create policy modules_tenant_isolation on modules
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

alter table lessons enable row level security;
alter table lessons force row level security;
create policy lessons_tenant_isolation on lessons
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

alter table lesson_assets enable row level security;
alter table lesson_assets force row level security;
create policy lesson_assets_tenant_isolation on lesson_assets
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

-- Per-user learning records: scope to self within org (admins read across org).
alter table progress enable row level security;
alter table progress force row level security;
create policy progress_tenant_isolation on progress
  using (
    org_id = app.current_org()
    and (user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (org_id = app.current_org() and user_id = app.current_user_id());

alter table quizzes enable row level security;
alter table quizzes force row level security;
create policy quizzes_tenant_isolation on quizzes
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

alter table quiz_attempts enable row level security;
alter table quiz_attempts force row level security;
create policy quiz_attempts_tenant_isolation on quiz_attempts
  using (
    org_id = app.current_org()
    and (user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (org_id = app.current_org() and user_id = app.current_user_id());

alter table certificates enable row level security;
alter table certificates force row level security;
create policy certificates_tenant_isolation on certificates
  using (
    org_id = app.current_org()
    and (user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (org_id = app.current_org());

-- ============================ webinars domain ==============================

alter table webinars enable row level security;
alter table webinars force row level security;
create policy webinars_tenant_isolation on webinars
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

alter table webinar_registrations enable row level security;
alter table webinar_registrations force row level security;
create policy webinar_registrations_tenant_isolation on webinar_registrations
  using (
    org_id = app.current_org()
    and (user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (org_id = app.current_org());

alter table webinar_recordings enable row level security;
alter table webinar_recordings force row level security;
create policy webinar_recordings_tenant_isolation on webinar_recordings
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

-- ============================ ai domain ====================================

alter table ai_conversations enable row level security;
alter table ai_conversations force row level security;
create policy ai_conversations_tenant_isolation on ai_conversations
  using (
    org_id = app.current_org()
    and (user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (org_id = app.current_org() and user_id = app.current_user_id());

alter table ai_messages enable row level security;
alter table ai_messages force row level security;
create policy ai_messages_tenant_isolation on ai_messages
  using (
    org_id = app.current_org()
    and (
      app.is_org_admin()
      or exists (
        select 1 from ai_conversations c
        where c.id = ai_messages.conversation_id
          and c.user_id = app.current_user_id()
      )
    )
  )
  with check (org_id = app.current_org());

alter table course_chunks enable row level security;
alter table course_chunks force row level security;
create policy course_chunks_tenant_isolation on course_chunks
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

-- ============================ journal domain ===============================

alter table trades enable row level security;
alter table trades force row level security;
create policy trades_tenant_isolation on trades
  using (
    org_id = app.current_org()
    and (user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (org_id = app.current_org() and user_id = app.current_user_id());

alter table trade_attachments enable row level security;
alter table trade_attachments force row level security;
create policy trade_attachments_tenant_isolation on trade_attachments
  using (
    org_id = app.current_org()
    and (
      app.is_org_admin()
      or exists (
        select 1 from trades t
        where t.id = trade_attachments.trade_id
          and t.user_id = app.current_user_id()
      )
    )
  )
  with check (org_id = app.current_org());

alter table analytics_snapshots enable row level security;
alter table analytics_snapshots force row level security;
create policy analytics_snapshots_tenant_isolation on analytics_snapshots
  using (
    org_id = app.current_org()
    and (user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (org_id = app.current_org() and user_id = app.current_user_id());

-- ============================ strategies domain ============================

alter table strategies enable row level security;
alter table strategies force row level security;
create policy strategies_tenant_isolation on strategies
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

alter table trade_ideas enable row level security;
alter table trade_ideas force row level security;
create policy trade_ideas_tenant_isolation on trade_ideas
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

-- NOTE: market_quotes and news_items are GLOBAL cached provider data (no
-- org_id). They are not tenant-scoped; reads are public to authenticated
-- callers and writes are service-role only. See 02_rls_global.sql.

-- ============================ community domain =============================

alter table community_channels enable row level security;
alter table community_channels force row level security;
create policy community_channels_tenant_isolation on community_channels
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

-- Posts: hide soft-deleted rows from non-admins; admins retain them for audit.
alter table community_posts enable row level security;
alter table community_posts force row level security;
create policy community_posts_tenant_isolation on community_posts
  using (
    org_id = app.current_org()
    and (deleted_at is null or app.is_org_admin())
  )
  with check (org_id = app.current_org());

alter table community_comments enable row level security;
alter table community_comments force row level security;
create policy community_comments_tenant_isolation on community_comments
  using (
    org_id = app.current_org()
    and (deleted_at is null or app.is_org_admin())
  )
  with check (org_id = app.current_org());

alter table reactions enable row level security;
alter table reactions force row level security;
create policy reactions_tenant_isolation on reactions
  using (org_id = app.current_org())
  with check (org_id = app.current_org() and user_id = app.current_user_id());

-- Reports: a reporter sees their own; org admins see the whole queue.
alter table reports enable row level security;
alter table reports force row level security;
create policy reports_tenant_isolation on reports
  using (
    org_id = app.current_org()
    and (reporter_user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (
    org_id = app.current_org()
    and reporter_user_id = app.current_user_id()
  );

alter table pods enable row level security;
alter table pods force row level security;
create policy pods_tenant_isolation on pods
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

alter table pod_members enable row level security;
alter table pod_members force row level security;
create policy pod_members_tenant_isolation on pod_members
  using (org_id = app.current_org())
  with check (org_id = app.current_org());

-- ============================ engagement domain ============================

alter table notifications enable row level security;
alter table notifications force row level security;
create policy notifications_tenant_isolation on notifications
  using (
    org_id = app.current_org()
    and (user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (org_id = app.current_org());

alter table notification_preferences enable row level security;
alter table notification_preferences force row level security;
create policy notification_preferences_tenant_isolation
  on notification_preferences
  using (
    org_id = app.current_org() and user_id = app.current_user_id()
  )
  with check (
    org_id = app.current_org() and user_id = app.current_user_id()
  );

-- ============================ affiliates domain ============================

alter table affiliates enable row level security;
alter table affiliates force row level security;
create policy affiliates_tenant_isolation on affiliates
  using (
    org_id = app.current_org()
    and (user_id = app.current_user_id() or app.is_org_admin())
  )
  with check (org_id = app.current_org());

alter table referrals enable row level security;
alter table referrals force row level security;
create policy referrals_tenant_isolation on referrals
  using (
    org_id = app.current_org()
    and (
      app.is_org_admin()
      or exists (
        select 1 from affiliates a
        where a.id = referrals.affiliate_id
          and a.user_id = app.current_user_id()
      )
    )
  )
  with check (org_id = app.current_org());

alter table commissions enable row level security;
alter table commissions force row level security;
create policy commissions_tenant_isolation on commissions
  using (
    org_id = app.current_org()
    and (
      app.is_org_admin()
      or exists (
        select 1 from affiliates a
        where a.id = commissions.affiliate_id
          and a.user_id = app.current_user_id()
      )
    )
  )
  with check (org_id = app.current_org());

alter table payouts enable row level security;
alter table payouts force row level security;
create policy payouts_tenant_isolation on payouts
  using (
    org_id = app.current_org()
    and (
      app.is_org_admin()
      or exists (
        select 1 from affiliates a
        where a.id = payouts.affiliate_id
          and a.user_id = app.current_user_id()
      )
    )
  )
  with check (org_id = app.current_org());

-- ============================ ops domain ===================================

-- audit_logs: org-scoped reads for org admins; service-role writes only.
-- Members cannot read the audit trail.
alter table audit_logs enable row level security;
alter table audit_logs force row level security;
create policy audit_logs_org_admin_read on audit_logs
  for select
  using (org_id = app.current_org() and app.is_org_admin());

-- feature_flags, idempotency_keys, event_outbox are GLOBAL infrastructure:
-- service-role only. RLS is enabled with NO permissive policy, so authenticated
-- (non-service) roles get zero rows by default. See 02_rls_global.sql.
