-- Reference migration for the M12 Community tables.
-- The orchestrator applies the authoritative version via Supabase migration
-- tooling (the canonical schema is owned by packages/db + F-series migrations).
-- The web app only reads/writes through the RLS-scoped client. (PROJECT.md §12;
-- §6.1 RLS — "RLS reads auth.jwt()/auth.uid() natively"; §411 Pro-only +
-- soft-delete for audit; §496 deleted_at on moderated content.)
--
-- This is the slice the M12 web screens need (posts + reports). The full model
-- (community_channels, community_comments, reactions, pods, pod_members) is owned
-- by the db package; this reference mirrors the columns the feed + report flow
-- depend on so community degrades gracefully if the canonical migration has not
-- run yet. Realtime presence/unread is NOT modeled here (stubbed in the UI).

create table if not exists public.community_posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  channel         text not null check (channel in (
                    'general', 'technical-analysis', 'fundamentals', 'psychology',
                    'journaling', 'wins-and-lessons', 'prop-firm-prep')),
  body            text not null check (char_length(body) between 1 and 2000),
  -- Stubbed attachment: filename only (no bytes, no scan yet). The upload worker
  -- rehosts + ClamAV-scans and fills attachment_url later (§12 uploads, §107).
  attachment_name text,
  attachment_url  text,
  -- Denormalized display fields (filled by trigger/worker in the full model).
  author_name     text,
  author_role     text check (author_role in ('Educator', 'Pro', 'Basic')),
  reaction_count  integer not null default 0,
  reply_count     integer not null default 0,
  -- Auto-hold + moderation. Held posts are hidden from the feed until reviewed.
  status          text not null default 'published'
                    check (status in ('published', 'held', 'removed')),
  -- Soft-delete for audit retention (§411, §496) — never hard-delete moderated rows.
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists community_posts_channel_idx
  on public.community_posts (channel, created_at desc);
create index if not exists community_posts_user_idx
  on public.community_posts (user_id);

alter table public.community_posts enable row level security;

-- Read: any authenticated member may read non-deleted, published posts. The
-- Pro-only entitlement gate is enforced server-side in the page AND should be
-- layered into this policy once entitlements are wired (§12 🔒 "Basic can't read
-- via direct URL — RLS + entitlement").
drop policy if exists "community_posts_select" on public.community_posts;
create policy "community_posts_select"
  on public.community_posts for select
  using (deleted_at is null and status = 'published');

-- Write: a member can only insert their own post.
drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

-- Authors may edit their own (not-yet-removed) post; moderation runs admin-side.
drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
  on public.community_posts for update
  using (auth.uid() = user_id and status <> 'removed')
  with check (auth.uid() = user_id);

-- ── Moderation reports (POST /community/reports, §410) ──────────────────────
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references auth.users (id) on delete cascade,
  target_type  text not null check (target_type in ('post', 'comment', 'user')),
  target_id    uuid not null,
  reason       text not null,
  note         text,
  -- Admin-side disposition (audited). Never resolved client-side.
  status       text not null default 'open'
                 check (status in ('open', 'reviewing', 'actioned', 'dismissed')),
  created_at   timestamptz not null default now()
);

create index if not exists reports_target_idx on public.reports (target_type, target_id);
create index if not exists reports_status_idx on public.reports (status);

alter table public.reports enable row level security;

-- A member may file a report (their own) and read only the reports they filed.
-- Moderators read/triage via a service-role admin path, not these policies.
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
  on public.reports for select
  using (auth.uid() = reporter_id);
