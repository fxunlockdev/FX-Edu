import type { Metadata } from 'next';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '../_components/SignOutButton';
import { summarize, type JournalSummary } from './journal-stats';
import {
  INSTRUMENT_OPTIONS,
  RESULT_OPTIONS,
  SESSION_OPTIONS,
  SETUP_OPTIONS,
  TRADE_SELECT_COLUMNS,
  directionLabel,
  resultLabel,
  sessionLabel,
  formatR,
  toNumber,
  type TradeRow,
} from './trade-fields';
import { JournalFilters, type JournalFilterValues } from './JournalFilters';
import './journal.css';

export const metadata: Metadata = {
  title: 'Trade Journal',
  robots: { index: false, follow: false },
};

interface JournalPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

/**
 * Trade Journal summary (RSC). The `(member)` layout already guaranteed a
 * session, so the trade read is RLS-scoped to this user — a user only ever sees
 * their own rows (PROJECT.md §6.1, §8.8). Filters live in the URL (shareable,
 * back-button friendly) and are applied at query time.
 *
 * Defensive read: if the `trades` table is not provisioned yet, the query
 * degrades to an empty state instead of erroring (mirrors the dashboard's
 * profile read during bring-up).
 */
export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = await searchParams;
  const filters: JournalFilterValues = {
    pair: firstParam(params.pair),
    result: firstParam(params.result),
    session: firstParam(params.session),
    setup: firstParam(params.setup),
    date: firstParam(params.date),
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rows: TradeRow[] = [];
  let tableMissing = false;

  if (user) {
    let query = supabase
      .from('trades')
      .select(TRADE_SELECT_COLUMNS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filters.pair) query = query.eq('instrument', filters.pair);
    if (filters.result) query = query.eq('result', filters.result);
    if (filters.session) query = query.eq('session', filters.session);
    if (filters.setup) query = query.eq('setup', filters.setup);
    if (filters.date) query = query.gte('created_at', `${filters.date}T00:00:00Z`);

    const { data, error } = await query;
    if (error) {
      // Undeployed table / RLS bring-up → degrade to empty state.
      tableMissing = true;
    } else {
      rows = (data as TradeRow[] | null) ?? [];
    }
  }

  const summary = summarize(rows);

  return (
    <div className="jrnl">
      <header className="jrnl-top">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone="lime-dark">Member</Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="jrnl-main" id="main">
        <div className="jrnl-head">
          <div>
            <h1 className="h-md">Trade Journal</h1>
            <p className="muted">
              Every trade you log becomes reviewable data. Over time, patterns become visible.
            </p>
          </div>
          <a href="/journal/new" className="btn btn-lime">
            + Log new trade
          </a>
        </div>

        <SummaryGrid summary={summary} />

        <section className="card card-pad" aria-labelledby="recent-trades-heading">
          <div className="jrnl-card-head">
            <h2 id="recent-trades-heading" style={{ fontSize: 16, fontWeight: 700 }}>
              Recent trades
            </h2>
            <JournalFilters
              values={filters}
              pairs={INSTRUMENT_OPTIONS}
              results={RESULT_OPTIONS}
              sessions={SESSION_OPTIONS}
              setups={SETUP_OPTIONS}
            />
          </div>

          {rows.length === 0 ? (
            <EmptyState filtered={hasAnyFilter(filters)} tableMissing={tableMissing} />
          ) : (
            <div className="jrnl-scroll">
              <TradesTable rows={rows} />
            </div>
          )}
        </section>

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </main>
    </div>
  );
}

function hasAnyFilter(f: JournalFilterValues): boolean {
  return !!(f.pair || f.result || f.session || f.setup || f.date);
}

/** Keys of the summary whose value is a displayable string (excludes `empty`). */
type SummaryStatKey = {
  [K in keyof JournalSummary]: JournalSummary[K] extends string ? K : never;
}[keyof JournalSummary];

const SUMMARY_CARDS: ReadonlyArray<{ label: string; key: SummaryStatKey; tone?: string }> = [
  { label: 'Trades · week', key: 'tradesThisWeek' },
  { label: 'Win rate', key: 'winRate', tone: 'text-pos' },
  { label: 'Avg R:R', key: 'avgRR' },
  { label: 'Net R · 30d', key: 'netR30d', tone: 'text-pos' },
  { label: 'Best pair', key: 'bestPair' },
  { label: 'Avg emotion', key: 'avgEmotion' },
];

function SummaryGrid({ summary }: { summary: JournalSummary }) {
  return (
    <div className="stat-grid">
      {SUMMARY_CARDS.map((c) => (
        <div className="sc" key={c.label}>
          <div className="l">{c.label}</div>
          <div className={`v ${c.tone ?? ''}`}>{summary[c.key]}</div>
        </div>
      ))}
    </div>
  );
}

function TradesTable({ rows }: { rows: ReadonlyArray<TradeRow> }) {
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th scope="col">Pair</th>
          <th scope="col">Direction</th>
          <th scope="col">Setup</th>
          <th scope="col">Session</th>
          <th scope="col">Result</th>
          <th scope="col" style={{ textAlign: 'right' }}>
            R multiple
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const dir = row.direction === 'short' ? 'short' : 'long';
          const r = toNumber(row.r_multiple);
          const resTone =
            row.result === 'win'
              ? 'var(--pos)'
              : row.result === 'loss'
                ? 'var(--neg)'
                : 'var(--outline)';
          return (
            <tr key={row.id}>
              <td className="cell-strong">{row.instrument}</td>
              <td>
                <span className={`dirpill ${dir}`}>{directionLabel(row.direction)}</span>
              </td>
              <td className="muted">{row.setup ?? '—'}</td>
              <td className="muted">{sessionLabel(row.session)}</td>
              <td style={{ color: resTone, fontWeight: 600 }}>{resultLabel(row.result)}</td>
              <td className="res" style={{ textAlign: 'right', color: resTone }}>
                {r === null ? '—' : formatR(row.r_multiple)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function EmptyState({ filtered, tableMissing }: { filtered: boolean; tableMissing: boolean }) {
  if (filtered) {
    return (
      <div className="jrnl-empty">
        <h3>No trades match these filters</h3>
        <p className="muted">Clear the filters to see your full journal.</p>
        <a href="/journal" className="btn btn-ghost btn-sm">
          Clear filters
        </a>
      </div>
    );
  }
  return (
    <div className="jrnl-empty">
      <h3>Your journal is empty</h3>
      <p className="muted">
        {tableMissing
          ? 'Journaling is being set up. Once it is ready, your logged trades will appear here.'
          : 'Log your first trade to start building a reviewable record of your decisions.'}
      </p>
      <a href="/journal/new" className="btn btn-lime btn-sm">
        Log your first trade
      </a>
    </div>
  );
}
