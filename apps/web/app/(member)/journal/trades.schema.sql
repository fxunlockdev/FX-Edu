-- Reference migration for the M5 Journal `trades` table.
-- The orchestrator applies the authoritative version via Supabase migration
-- tooling (the canonical schema is packages/db/src/schema/journal.ts). The web
-- app only reads/writes this through the RLS-scoped client. (PROJECT.md §8.8;
-- §6.1 RLS — "RLS reads auth.jwt()/auth.uid() natively".)
--
-- This is the slice the M5 web screens need. The full org-scoped model
-- (org_id, trade_attachments, analytics_snapshots) is owned by the db package
-- and F-series migrations; this reference mirrors the user-owned columns the
-- summary page + Log Trade form depend on so journaling degrades gracefully if
-- the canonical migration has not run yet.

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
  -- Server-computed authoritatively by the analytics worker (§8.8). The web app
  -- writes a client estimate on save so the UI is populated immediately; the
  -- worker overwrites for tamper-resistance.
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

-- A user can only see and write their own trades.
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
