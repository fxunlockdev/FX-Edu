-- Reference migration for the M2 onboarding `profiles` table.
-- The orchestrator applies this via the Supabase migration tooling; the web app
-- only reads/writes it through the RLS-scoped browser client. (PROJECT.md §8.2
-- data model; §6.1 RLS — "RLS reads auth.jwt()/auth.uid() natively".)
--
-- This is the minimal slice M2 needs (the trading profile). The full
-- users/profiles/organizations/memberships model is owned by F2/F3.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  experience_level   text,
  main_goal          text,
  account_size       text,
  risk_comfort       text,
  acquisition_source text,
  onboarded_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user can only see and write their own profile row.
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
