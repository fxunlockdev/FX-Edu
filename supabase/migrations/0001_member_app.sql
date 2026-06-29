-- ============================================================================
-- 0001_member_app.sql — Web-aligned member-app persistence schema (Supabase)
-- ============================================================================
-- This migration creates exactly the tables + view the FX Academy WEB app
-- reads and writes, so the member app persists data on Supabase.
--
-- SCHEMA FLAVOUR: this is the WEB-ALIGNED, `auth.uid()`-keyed schema. Owner
-- columns reference `auth.users(id)` directly and every RLS policy is scoped
-- with `auth.uid() = <owner>` — the native Supabase pattern the web's
-- RLS-scoped browser/server clients depend on.
--
-- It is INTENTIONALLY NOT the canonical `packages/db` Drizzle schema, which
-- routes ownership through `public.users` and targets the not-yet-deployed API.
-- Harmonizing this web-aligned slice with the canonical Drizzle schema (org_id,
-- public.users FKs, content/quiz tables, attachments, analytics snapshots) is a
-- tracked FOLLOW-UP — do not "fix" this file to match Drizzle; the web reads it
-- as-is today.
--
-- The shapes/RLS below come from the five reference schema files committed
-- alongside the web modules (profiles / trades / lesson_progress / settings /
-- community). Objects WITHOUT a reference file (certificates, subscriptions,
-- webinars, and the public_certificate_verifications view) were derived from
-- the web's actual `.from()/.select()/.insert()/.upsert()` usage and the typed
-- *_SELECT_COLUMNS / *Row constants.
--
-- Idempotent: safe to run repeatedly (create ... if not exists, drop policy
-- if exists before create, create or replace view, create or replace function).
-- The orchestrator applies this via the Supabase MCP — do not apply by hand.
-- ============================================================================

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ============================================================================
-- profiles  (owner: id = auth.uid())
--   Ref: apps/web/lib/onboarding/profiles.schema.sql + settings.schema.sql.
--   Written via upsert(onConflict: 'id') from save-profile.ts and
--   save-settings.ts. The trigger below seeds one row per new auth user.
-- ============================================================================
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  -- onboarding (M2)
  experience_level   text,
  main_goal          text,
  account_size       text,
  risk_comfort       text,
  acquisition_source text,
  onboarded_at       timestamptz,
  -- settings (M17) — additive columns the settings module writes
  full_name          text,
  display_name       text,
  country            text, -- ISO-3166 alpha-2
  bio                text,
  risk_profile       text, -- conservative | balanced | aggressive
  default_session    text, -- london | new_york | tokyo | sydney
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- ============================================================================
-- trades  (owner: user_id = auth.uid())
--   Ref: apps/web/app/(member)/journal/trades.schema.sql.
--   Inserted from save-trade.ts; summary page reads its own rows.
-- ============================================================================
create table if not exists public.trades (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  instrument   varchar(32) not null,
  direction    text not null check (direction in ('long', 'short')),
  setup        varchar(120),
  session      text check (session in ('sydney', 'tokyo', 'london', 'new_york')),
  entry        numeric(18, 6),
  stop_loss    numeric(18, 6),
  take_profit  numeric(18, 6),
  result       text not null default 'open'
                 check (result in ('open', 'win', 'loss', 'breakeven')),
  r_multiple   numeric(10, 2),
  emotion      integer check (emotion between 1 and 10),
  thesis       text,
  reflection   text,
  status       text not null default 'draft' check (status in ('draft', 'logged')),
  opened_at    timestamptz,
  closed_at    timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists trades_user_idx on public.trades (user_id);
create index if not exists trades_user_result_idx on public.trades (user_id, result);

alter table public.trades enable row level security;

drop policy if exists "trades_select_own" on public.trades;
create policy "trades_select_own"
  on public.trades for select
  using (auth.uid() = user_id);

drop policy if exists "trades_insert_own" on public.trades;
create policy "trades_insert_own"
  on public.trades for insert
  with check (auth.uid() = user_id);

drop policy if exists "trades_update_own" on public.trades;
create policy "trades_update_own"
  on public.trades for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "trades_delete_own" on public.trades;
create policy "trades_delete_own"
  on public.trades for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- lesson_progress  (owner: user_id = auth.uid())
--   Ref: apps/web/app/(member)/learn/_components/lesson-progress.schema.sql.
--   Upserted (onConflict: 'user_id,lesson_id') from lesson-progress.ts.
-- ============================================================================
create table if not exists public.lesson_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  lesson_id        varchar(160) not null,
  position_seconds integer not null default 0 check (position_seconds >= 0),
  completed        boolean not null default false,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lesson_progress_user_idx
  on public.lesson_progress (user_id);
create index if not exists lesson_progress_user_completed_idx
  on public.lesson_progress (user_id, completed);

alter table public.lesson_progress enable row level security;

drop policy if exists "lesson_progress_select_own" on public.lesson_progress;
create policy "lesson_progress_select_own"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

drop policy if exists "lesson_progress_insert_own" on public.lesson_progress;
create policy "lesson_progress_insert_own"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "lesson_progress_update_own" on public.lesson_progress;
create policy "lesson_progress_update_own"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "lesson_progress_delete_own" on public.lesson_progress;
create policy "lesson_progress_delete_own"
  on public.lesson_progress for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- notification_preferences  (owner: user_id = auth.uid())
--   Ref: apps/web/app/(member)/settings/settings.schema.sql.
--   Upserted (onConflict: 'user_id') from save-settings.ts.
-- ============================================================================
create table if not exists public.notification_preferences (
  user_id           uuid primary key references auth.users (id) on delete cascade,
  webinar_reminders boolean not null default true,
  trade_ideas       boolean not null default true,
  community_replies boolean not null default true,
  weekly_digest     boolean not null default false,
  product_updates   boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "notif_prefs_select_own" on public.notification_preferences;
create policy "notif_prefs_select_own"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "notif_prefs_insert_own" on public.notification_preferences;
create policy "notif_prefs_insert_own"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "notif_prefs_update_own" on public.notification_preferences;
create policy "notif_prefs_update_own"
  on public.notification_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notif_prefs_delete_own" on public.notification_preferences;
create policy "notif_prefs_delete_own"
  on public.notification_preferences for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- notifications  (owner: user_id = auth.uid())
--   Ref: apps/web/app/(member)/settings/settings.schema.sql.
--   Read via NOTIFICATION_SELECT_COLUMNS; only `read_at` is updated client-side
--   (mark-read.ts). Inserts are server-side (service role); no member INSERT
--   policy is granted on purpose.
-- ============================================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  category   text not null check (category in ('webinars', 'community', 'progress')),
  kind       text not null,        -- e.g. live | idea | reply | reaction | cert
  title      text not null,
  body       text,
  read_at    timestamptz,          -- null = unread
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Members may only mark their own notifications read (the `read_at` column);
-- inserts/deletes are server-side via the service role.
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- community_posts  (owner: user_id = auth.uid())
--   Ref: apps/web/app/(member)/community/community.schema.sql.
--   Inserted from create-post.ts. SELECT is open to any authenticated member
--   for non-deleted, published rows (entitlement gate layered server-side).
-- ============================================================================
create table if not exists public.community_posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  channel         text not null check (channel in (
                    'general', 'technical-analysis', 'fundamentals', 'psychology',
                    'journaling', 'wins-and-lessons', 'prop-firm-prep')),
  body            text not null check (char_length(body) between 1 and 2000),
  attachment_name text,
  attachment_url  text,
  author_name     text,
  author_role     text check (author_role in ('Educator', 'Pro', 'Basic')),
  reaction_count  integer not null default 0,
  reply_count     integer not null default 0,
  status          text not null default 'published'
                    check (status in ('published', 'held', 'removed')),
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists community_posts_channel_idx
  on public.community_posts (channel, created_at desc);
create index if not exists community_posts_user_idx
  on public.community_posts (user_id);

alter table public.community_posts enable row level security;

drop policy if exists "community_posts_select" on public.community_posts;
create policy "community_posts_select"
  on public.community_posts for select
  using (deleted_at is null and status = 'published');

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
  on public.community_posts for update
  using (auth.uid() = user_id and status <> 'removed')
  with check (auth.uid() = user_id);

-- ============================================================================
-- reports  (owner: reporter_id = auth.uid())
--   Ref: apps/web/app/(member)/community/community.schema.sql.
--   Inserted from report-target.ts. Members read only their own filed reports;
--   admin triage runs via the service role. No member UPDATE/DELETE granted.
-- ============================================================================
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references auth.users (id) on delete cascade,
  target_type  text not null check (target_type in ('post', 'comment', 'user')),
  target_id    uuid not null,
  reason       text not null,
  note         text,
  status       text not null default 'open'
                 check (status in ('open', 'reviewing', 'actioned', 'dismissed')),
  created_at   timestamptz not null default now()
);

create index if not exists reports_target_idx on public.reports (target_type, target_id);
create index if not exists reports_status_idx on public.reports (status);

alter table public.reports enable row level security;

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- ============================================================================
-- certificates  (owner: user_id = auth.uid())  [DERIVED — no reference file]
--   Source of columns: apps/web/app/(member)/certificates/page.tsx
--     (.from('certificates').select(CERTIFICATE_SELECT_COLUMNS).eq('user_id', …))
--   and certificates/_components/certificate-types.ts
--     (CertificateRow + CERTIFICATE_SELECT_COLUMNS:
--      tier, status, progress_pct, issued_at, verification_id, learner_name).
--   Extra columns `name`/`tier_label` are surfaced through the public verify
--   VIEW below (apps/web/app/verify/_lib/verification.ts selects them), so they
--   live on this table. `verification_id` is the opaque public token (NOT the
--   PK). Minting is SERVER-SIDE only; the member page only reads its own rows.
-- ============================================================================
create table if not exists public.certificates (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  tier            text not null,  -- e.g. tier-1 (matches TIER_CATALOG slugs)
  -- Course / certificate name + human tier label (read by the verify view).
  name            text,           -- e.g. Forex Foundations
  tier_label      text,           -- e.g. Tier 1
  status          text not null default 'locked'
                    check (status in ('earned', 'progress', 'locked')),
  progress_pct    integer check (progress_pct between 0 and 100),
  issued_at       timestamptz,
  -- Opaque public verification token shown in /verify/[id]. Unique so the
  -- public verify view can resolve it 1:1. Null until the cert is minted.
  verification_id text unique,
  learner_name    text,
  -- Soft revocation: revoked certs must read as "not valid" via the verify view
  -- without exposing an exists-but-revoked oracle.
  revoked_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, tier)
);

create index if not exists certificates_user_idx on public.certificates (user_id);

alter table public.certificates enable row level security;

-- A member only ever reads their own certificate rows (page.tsx eq user_id).
-- Minting/updating/revoking is server-side via the service role — no member
-- INSERT/UPDATE/DELETE policy is granted on purpose.
drop policy if exists "certificates_select_own" on public.certificates;
create policy "certificates_select_own"
  on public.certificates for select
  using (auth.uid() = user_id);

-- ============================================================================
-- subscriptions  (owner: user_id = auth.uid())  [DERIVED — no reference file]
--   Source of columns: apps/web/app/(member)/billing/page.tsx
--     (.from('subscriptions').select(SUBSCRIPTION_SELECT_COLUMNS)
--       .eq('user_id', …).maybeSingle())
--   and billing/_components/billing-data.ts
--     (SubscriptionRow + SUBSCRIPTION_SELECT_COLUMNS:
--      plan_id, status, interval, current_period_end, cancel_at_period_end,
--      card_last4, card_brand, card_exp_month, card_exp_year).
--   Stripe is the system of record; rows are written server-side by webhooks.
--   The member only ever READS their own row (display only — card_last4 etc.).
-- ============================================================================
create table if not exists public.subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  plan_id              text,
  status               text not null default 'none'
                         check (status in ('active', 'trialing', 'past_due',
                                           'canceled', 'none')),
  interval             text check (interval in ('month', 'year')),
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  -- Card-on-file summary — display only (Stripe owns the PAN; never stored here).
  card_last4           text,
  card_brand           text,
  card_exp_month       integer check (card_exp_month between 1 and 12),
  card_exp_year        integer,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id)
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

-- Member reads their own subscription. All writes are server-side (Stripe
-- webhooks via service role) — no member INSERT/UPDATE/DELETE policy.
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ============================================================================
-- webinars  (PUBLIC read for any authenticated member)  [DERIVED — no ref file]
--   Source of usage: apps/web/app/(member)/sessions/page.tsx
--     (.from('webinars').select('id').limit(1)) — a best-effort liveness probe
--   that degrades to a typed seed today. Columns are derived from the
--   LiveSession seed shape the page maps onto (title, topic, schedule, plan
--   gating, Mux/recording fields) so a future read can hydrate the UI.
--   Not user-owned: webinars are catalogue content, readable by any member.
-- ============================================================================
create table if not exists public.webinars (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  topic         text,            -- maps to the sessions topic filter
  host_name     text,
  -- Plan gate: 'basic' = open to all; otherwise Pro/Elite-only (entitlement is
  -- re-checked server-side before a signed playback token is minted).
  min_plan      text not null default 'basic'
                  check (min_plan in ('basic', 'pro', 'elite')),
  starts_at     timestamptz,
  ends_at       timestamptz,
  status        text not null default 'scheduled'
                  check (status in ('scheduled', 'live', 'ended', 'canceled')),
  -- Mux/live + recording handles (stubbed in the UI today).
  mux_playback_id   text,
  recording_url     text,
  recording_ready   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists webinars_starts_at_idx on public.webinars (starts_at);

alter table public.webinars enable row level security;

-- Public read: any authenticated member may list webinars. Writes are
-- server-side (admin/service role) — no member write policy.
drop policy if exists "webinars_select_authenticated" on public.webinars;
create policy "webinars_select_authenticated"
  on public.webinars for select
  to authenticated
  using (true);

-- ============================================================================
-- handle_new_user trigger
--   Seeds a profiles row when a new auth user is created, so onboarding always
--   has a row to UPDATE/upsert. SECURITY DEFINER + fixed search_path so it can
--   write public.profiles regardless of the caller's RLS context.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- public_certificate_verifications  (VIEW — minimal-disclosure public verify)
--   Source of usage: apps/web/app/verify/_lib/verification.ts
--     (.from('public_certificate_verifications')
--        .select('name, tier_label, issued_at, learner_name')
--        .eq('verification_id', id).maybeSingle())
--
--   This view is the ONLY public surface for certificate verification. It must
--   leak nothing beyond what the verify page shows: validity, certificate/tier
--   name, issue date, and a minimal learner identity (the app further reduces
--   learner_name to "First L." client-side). It exposes NO user_id, email,
--   org_id, status, progress, or any other column.
--
--   security_barrier prevents predicate push-down from leaking filtered rows;
--   security_invoker = false (default) means the view reads the base table with
--   the VIEW OWNER's rights, bypassing the per-member RLS on `certificates` so
--   an anonymous caller can verify a cert by its opaque token. Only earned,
--   non-revoked rows with a verification_id are visible.
-- ============================================================================
create or replace view public.public_certificate_verifications
  with (security_barrier = true) as
  select
    c.verification_id,
    c.name,
    c.tier_label,
    c.issued_at,
    c.learner_name
  from public.certificates c
  where c.status = 'earned'
    and c.verification_id is not null
    and c.revoked_at is null;

-- Allow anonymous + authenticated verifiers to read the minimal view only.
grant select on public.public_certificate_verifications to anon, authenticated;

-- ============================================================================
-- end 0001_member_app.sql
-- ============================================================================
