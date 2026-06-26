import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '../_components/SignOutButton';
import { TRADE_SELECT_COLUMNS, type TradeRow } from '../journal/trade-fields';
import { analyze } from './_components/analytics';
import { AnalyticsView } from './_components/AnalyticsView';
import { AnalyticsFilters, type AnalyticsFilterValues } from './_components/AnalyticsFilters';
import { UpgradeLock } from './_components/UpgradeLock';
import './analytics.css';

export const metadata: Metadata = {
  title: 'Performance Analytics',
  robots: { index: false, follow: false },
};

interface AnalyticsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Resolve the lookback window key to an ISO lower-bound, or null for "all". */
function rangeStart(range: string, now: number): string | null {
  if (range === '30d') return new Date(now - 30 * DAY_MS).toISOString();
  if (range === 'ytd') return new Date(new Date(now).getUTCFullYear(), 0, 1).toISOString();
  if (range === 'all') return null;
  // default 90d
  return new Date(now - 90 * DAY_MS).toISOString();
}

const RANGE_LABEL: Record<string, string> = {
  '30d': 'last 30 days',
  '90d': 'last 90 days',
  ytd: 'this year',
  all: 'all time',
};

/**
 * Derive the caller's plan. There is no subscription/entitlement data wired at
 * runtime yet, so we defensively treat everyone as Basic and show the locked
 * "Upgrade to Pro" state. Returns `boolean` (not a literal) so the Pro branch
 * below is real, type-reachable code that compiles unchanged once the flag is
 * fed by the entitlements API.
 *
 * @param _userId reserved — the entitlements lookup will key on it.
 */
function derivePlanIsPro(_userId: string | undefined): boolean {
  // TODO: read plan from /entitlements once the API is runtime-wired
  return false;
}

/**
 * Performance Analytics (RSC) — Pro-gated, PROJECT.md §9 module 6 / §8.9.
 *
 * Auth is already guaranteed by the `(member)` layout. The entitlement (plan)
 * gate is enforced HERE, server-side, before any trade query runs — UI locks
 * are only hints (§6.1).
 *
 * Plan derivation is defensive: there is no subscription data wired yet, so we
 * treat the caller as Basic and render the designed "Upgrade to Pro" locked
 * state. When the entitlements API is runtime-wired this single flag flips.
 * // TODO: read plan from /entitlements once the API is runtime-wired
 *
 * Pro path: read the caller's trades through the RLS-scoped server client (a
 * user only ever sees their own rows), exclude open/draft trades unless the
 * toggle opts them in, run the pure `analyze()` math and render the dashboard.
 * Degrades to an empty state if the `trades` table isn't deployed yet.
 */
export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const filters: AnalyticsFilterValues = {
    range: firstParam(params.range) || '90d',
    includeOpen: firstParam(params.open) === '1',
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Entitlement gate (server-side). Defaults to Basic until wired. ──────
  const isPro = derivePlanIsPro(user?.id);

  if (!isPro) {
    return (
      <Shell isPro={false}>
        <div className="ana-head">
          <div>
            <h1 className="h-md">Performance Analytics</h1>
            <p className="muted">A Pro coaching dashboard built from your own trade journal.</p>
          </div>
        </div>
        <UpgradeLock />
        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </Shell>
    );
  }

  // ── Pro path: RLS-scoped trade read with the range window applied. ──────
  const now = Date.now();
  const lowerBound = rangeStart(filters.range, now);

  let rows: TradeRow[] = [];
  let tableMissing = false;

  if (user) {
    let query = supabase
      .from('trades')
      .select(TRADE_SELECT_COLUMNS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(2000);

    // Exclude open/draft trades unless the caller opted them in.
    if (!filters.includeOpen) query = query.neq('result', 'open');
    if (lowerBound) query = query.gte('created_at', lowerBound);

    const { data, error } = await query;
    if (error) {
      tableMissing = true;
    } else {
      rows = (data as TradeRow[] | null) ?? [];
    }
  }

  const analytics = analyze(rows, now);

  return (
    <Shell isPro>
      <div className="ana-head">
        <div>
          <h1 className="h-md">Performance Analytics</h1>
          <p className="muted">
            {analytics.empty
              ? 'Your coaching dashboard, built from your own logged trades.'
              : `${analytics.summary.tradesAnalyzed} trades analyzed · ${RANGE_LABEL[filters.range] ?? 'last 90 days'}`}
          </p>
        </div>
        <AnalyticsFilters values={filters} />
      </div>

      {analytics.empty ? (
        <EmptyState tableMissing={tableMissing} />
      ) : (
        <AnalyticsView data={analytics} />
      )}

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </Shell>
  );
}

function Shell({ isPro, children }: { isPro: boolean; children: ReactNode }) {
  return (
    <div className="ana">
      <header className="ana-top">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={isPro ? 'lime-dark' : 'outline'}>{isPro ? 'Pro' : 'Basic'}</Badge>
          <SignOutButton />
        </div>
      </header>
      <main className="ana-main" id="main">
        {children}
      </main>
    </div>
  );
}

function EmptyState({ tableMissing }: { tableMissing: boolean }) {
  return (
    <div className="ana-empty">
      <h2>No closed trades to analyze yet</h2>
      <p className="muted">
        {tableMissing
          ? 'Analytics is being set up. Once journaling is live, your closed trades will turn into a performance breakdown here.'
          : 'Log and close a few trades in your journal — your win rate, R curve and session breakdown appear here as soon as there is data.'}
      </p>
      <a href="/journal/new" className="btn btn-lime btn-sm">
        Log a trade
      </a>
    </div>
  );
}
