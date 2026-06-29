-- Reference migration for the M17 Settings & Notifications module.
-- The orchestrator applies this via the Supabase migration tooling; the web app
-- only reads/writes through the RLS-scoped browser/server clients.
-- (PROJECT.md §8.16; §6.1 RLS — "RLS reads auth.uid() natively".)
--
-- Column names match the camelCase→snake_case mapping in `settings-fields.ts`
-- and the writes in `save-settings.ts`. The full users/profiles model is owned
-- by F2/F3; this is the additive slice M17 needs.

-- ── profiles: settings columns (additive to the M2 onboarding table) ───────
alter table public.profiles add column if not exists full_name       text;
alter table public.profiles add column if not exists display_name    text;
alter table public.profiles add column if not exists country         text; -- ISO-3166 alpha-2
alter table public.profiles add column if not exists bio             text;
alter table public.profiles add column if not exists risk_profile    text; -- conservative|balanced|aggressive
alter table public.profiles add column if not exists default_session text; -- london|new_york|tokyo|sydney
-- RLS policies for `profiles` are already defined in profiles.schema.sql
-- (select/insert/update scoped to auth.uid() = id) and cover these columns.

-- ── notification_preferences: one row per user, RLS-scoped ─────────────────
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

-- ── notifications: the in-app inbox, RLS-scoped, read-on-click ─────────────
-- `category` groups rows into the inbox tabs (all is the union); `kind` selects
-- the row icon/treatment. Rows are written server-side by the Lifecycle
-- Messaging fan-out (§9 module 15); the member app only reads + marks read.
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

-- A user can only see their own notifications.
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

-- A user may mark their own notifications read (the only column they should be
-- able to change is `read_at`; inserts are server-side via the service role).
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
