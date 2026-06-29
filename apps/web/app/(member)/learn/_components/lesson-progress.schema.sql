-- Reference migration for the M3 Lesson Player `lesson_progress` table.
-- The orchestrator applies the authoritative version via Supabase migration
-- tooling (the canonical schema is owned by the db package + F-series
-- migrations). The web app only reads/writes this through the RLS-scoped client.
-- (PROJECT.md §8.4 progress/completion; §6.1 RLS — "RLS reads auth.uid() natively".)
--
-- This is the slice the M3 web screens need so the library + player degrade
-- gracefully if the canonical migration has not run yet. The full content model
-- (courses/modules/lessons/lesson_assets/quizzes/quiz_attempts) is owned by the
-- db package; the web catalogue is static (`courses-data.ts`) until those land.
--
-- IMPORTANT: completion here is the v1 "user clicked complete" signal. PROJECT.md
-- §8.4 requires the server worker to re-verify watch %/quiz before this counts
-- toward certificate progress — certificate progress must not be client-forgeable.

create table if not exists public.lesson_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  -- Lesson slug from the static catalogue (apps/web .../learn/_components/courses-data.ts).
  -- Becomes an FK to public.lessons once the content tables are migrated.
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

-- A user can only see and write their own progress.
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
