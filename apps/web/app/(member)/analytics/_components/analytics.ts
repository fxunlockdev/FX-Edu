/**
 * Pure Performance Analytics math (PROJECT.md §9 module 6 / §8.9). No I/O, no
 * clock dependency beyond an injectable `now`, no mutation — takes the caller's
 * RLS-scoped trade rows and returns the headline summary, the chart series, and
 * deterministic, data-derived insights.
 *
 * This is the testable core. The RSC page (`page.tsx`) handles auth, the Pro
 * gate, and the Supabase read; everything quantitative lives here so it can be
 * unit-tested in isolation and (later) reused by the `analytics_snapshots`
 * worker (§8.9 / §12) without dragging in React or the DB client.
 *
 * Conventions reused from the journal layer (journal-stats.ts):
 *  - "decided" = win | loss | breakeven (open trades excluded from win rate).
 *  - R-multiples come pre-computed on the row (`r_multiple`); we never recompute
 *    here — the journal write path already used `@fxunlock/trading rMultiple`.
 *  - Open / draft trades are excluded from all realized-R math; the page decides
 *    whether they reach this function at all (a toggle can include them).
 *
 * Nothing here recommends a trade. Insights describe the user's own logged
 * history and are clearly framed as data-derived, never as advice (§9 module 6:
 * "insights non-advisory").
 */
import {
  formatR,
  sessionLabel,
  toNumber,
  type TradeRow,
} from '../../journal/trade-fields';

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** A trade that contributes to realized-R math (closed, with a numeric R). */
function isDecided(result: string | null): boolean {
  return result === 'win' || result === 'loss' || result === 'breakeven';
}

function rowTime(row: TradeRow): number {
  const stamp = row.closed_at ?? row.opened_at ?? row.created_at;
  const t = stamp ? Date.parse(stamp) : NaN;
  return Number.isFinite(t) ? t : NaN;
}

// ── Public shapes ─────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  /** Win rate over decided trades, e.g. "58%" or "—" when none decided. */
  readonly winRate: string;
  /** Average realized R across closed trades, signed, e.g. "+1.9R". */
  readonly avgR: string;
  /** Net (cumulative) realized R, signed, e.g. "+74R". */
  readonly netR: string;
  /** Average risk %, e.g. "1.1%" — placeholder "—" until risk_percent lands. */
  readonly avgRisk: string;
  /** Count of closed trades analyzed. */
  readonly tradesAnalyzed: string;
  /** Consistency grade A+…D, or "—" with too little data. */
  readonly consistencyGrade: string;
  /** True when there is no usable closed-trade data. */
  readonly empty: boolean;
}

export interface SeriesPoint {
  readonly label: string;
  readonly value: number;
}

export interface AnalyticsSeries {
  /** Cumulative net R after each closed trade, in chronological order. */
  readonly netROverTime: ReadonlyArray<SeriesPoint>;
  /** Win rate % by trading session (only sessions with data). */
  readonly winRateBySession: ReadonlyArray<SeriesPoint>;
  /** Win rate % by day of week (Mon–Sun, only days with data). */
  readonly winRateByDayOfWeek: ReadonlyArray<SeriesPoint>;
  /** Average R by setup (only setups with data), best-first. */
  readonly avgRBySetup: ReadonlyArray<SeriesPoint>;
  /** Average R by instrument/pair (only pairs with data), best-first. */
  readonly avgRByPair: ReadonlyArray<SeriesPoint>;
}

export interface AnalyticsInsight {
  readonly id: string;
  readonly text: string;
}

export interface Analytics {
  readonly summary: AnalyticsSummary;
  readonly series: AnalyticsSeries;
  readonly insights: ReadonlyArray<AnalyticsInsight>;
  /** True when no closed trades were available to analyze. */
  readonly empty: boolean;
}

// ── Grouping accumulator (mutated locally, never escapes) ──────────────────

interface Bucket {
  wins: number;
  decided: number;
  rSum: number;
  rCount: number;
}

function emptyBucket(): Bucket {
  return { wins: 0, decided: 0, rSum: 0, rCount: 0 };
}

function addToBucket(bucket: Bucket, result: string | null, r: number | null): void {
  if (isDecided(result)) {
    bucket.decided += 1;
    if (result === 'win') bucket.wins += 1;
  }
  if (r !== null) {
    bucket.rSum += r;
    bucket.rCount += 1;
  }
}

function winRatePct(bucket: Bucket): number | null {
  return bucket.decided > 0 ? Math.round((bucket.wins / bucket.decided) * 100) : null;
}

function avgR(bucket: Bucket): number | null {
  return bucket.rCount > 0 ? bucket.rSum / bucket.rCount : null;
}

/** Only closed trades with a parseable R contribute to realized-R analytics. */
function closedTrades(rows: ReadonlyArray<TradeRow>): TradeRow[] {
  return rows.filter((row) => row.result !== 'open' && row.result !== null);
}

// ── Summary ────────────────────────────────────────────────────────────────

/**
 * Consistency grade: a deterministic readability grade, NOT a performance
 * promise. It rewards a positive expectancy (avg R) and a steady win rate over
 * a meaningful sample. With < 5 decided trades we return "—" (too little data).
 */
function consistencyGrade(avgRValue: number | null, winRate: number | null, decided: number): string {
  if (decided < 5 || avgRValue === null || winRate === null) return '—';
  // Score blends expectancy and hit-rate; clamped, then bucketed to a letter.
  const expectancyScore = Math.max(0, Math.min(1, (avgRValue + 1) / 3)); // -1R→0, +2R→1
  const winScore = Math.max(0, Math.min(1, winRate / 100));
  const score = expectancyScore * 0.6 + winScore * 0.4;
  if (score >= 0.8) return 'A+';
  if (score >= 0.7) return 'A';
  if (score >= 0.6) return 'B+';
  if (score >= 0.5) return 'B';
  if (score >= 0.4) return 'C';
  return 'D';
}

function buildSummary(closed: ReadonlyArray<TradeRow>): AnalyticsSummary {
  if (closed.length === 0) {
    return {
      winRate: '—',
      avgR: '—',
      netR: '0.0R',
      avgRisk: '—',
      tradesAnalyzed: '0',
      consistencyGrade: '—',
      empty: true,
    };
  }

  const overall = emptyBucket();
  let netR = 0;

  for (const row of closed) {
    const r = toNumber(row.r_multiple);
    addToBucket(overall, row.result, r);
    if (r !== null) netR += r;
  }

  const winRate = winRatePct(overall);
  const average = avgR(overall);

  return {
    winRate: winRate === null ? '—' : `${winRate}%`,
    avgR: average === null ? '—' : formatR(average),
    netR: formatR(netR),
    // risk_percent is not yet read on TradeRow; surfaced as "—" until wired.
    avgRisk: '—',
    tradesAnalyzed: String(closed.length),
    consistencyGrade: consistencyGrade(average, winRate, overall.decided),
    empty: false,
  };
}

// ── Series ───────────────────────────────────────────────────────────────

function netROverTime(closed: ReadonlyArray<TradeRow>): SeriesPoint[] {
  const ordered = [...closed].sort((a, b) => {
    const ta = rowTime(a);
    const tb = rowTime(b);
    const sa = Number.isFinite(ta) ? ta : 0;
    const sb = Number.isFinite(tb) ? tb : 0;
    return sa - sb;
  });

  const points: SeriesPoint[] = [];
  let cumulative = 0;
  let index = 0;
  for (const row of ordered) {
    const r = toNumber(row.r_multiple);
    if (r === null) continue;
    cumulative += r;
    index += 1;
    points.push({ label: `Trade ${index}`, value: Number(cumulative.toFixed(2)) });
  }
  return points;
}

function groupBy(
  closed: ReadonlyArray<TradeRow>,
  key: (row: TradeRow) => string | null,
): Map<string, Bucket> {
  const map = new Map<string, Bucket>();
  for (const row of closed) {
    const k = key(row);
    if (!k) continue;
    const bucket = map.get(k) ?? emptyBucket();
    addToBucket(bucket, row.result, toNumber(row.r_multiple));
    map.set(k, bucket);
  }
  return map;
}

function winRateSeries(map: Map<string, Bucket>, label: (k: string) => string): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (const [k, bucket] of map) {
    const wr = winRatePct(bucket);
    if (wr === null) continue;
    out.push({ label: label(k), value: wr });
  }
  return out;
}

function avgRSeries(map: Map<string, Bucket>, label: (k: string) => string): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  for (const [k, bucket] of map) {
    const a = avgR(bucket);
    if (a === null) continue;
    out.push({ label: label(k), value: Number(a.toFixed(2)) });
  }
  // Best-first so the strongest setups/pairs read at the top of a bar chart.
  return out.sort((x, y) => y.value - x.value);
}

function dayOfWeekKey(row: TradeRow): string | null {
  const t = rowTime(row);
  if (!Number.isFinite(t)) return null;
  // getUTCDay() is 0–6, so the lookup is always defined; `?? null` satisfies
  // noUncheckedIndexedAccess without changing behaviour.
  return DOW_LABELS[new Date(t).getUTCDay()] ?? null;
}

function buildSeries(closed: ReadonlyArray<TradeRow>): AnalyticsSeries {
  const bySession = groupBy(closed, (r) => r.session);
  const byDow = groupBy(closed, dayOfWeekKey);
  const bySetup = groupBy(closed, (r) => r.setup);
  const byPair = groupBy(closed, (r) => r.instrument);

  // Order day-of-week Mon→Sun for a readable axis.
  const dowOrder: ReadonlyArray<string> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dowSeries = winRateSeries(byDow, (k) => k).sort(
    (a, b) => dowOrder.indexOf(a.label) - dowOrder.indexOf(b.label),
  );

  return {
    netROverTime: netROverTime(closed),
    winRateBySession: winRateSeries(bySession, (k) => sessionLabel(k)),
    winRateByDayOfWeek: dowSeries,
    avgRBySetup: avgRSeries(bySetup, (k) => k),
    avgRByPair: avgRSeries(byPair, (k) => k),
  };
}

// ── Insights (deterministic, data-derived, NON-advisory) ───────────────────

function best(points: ReadonlyArray<SeriesPoint>): SeriesPoint | null {
  let top: SeriesPoint | null = null;
  for (const p of points) {
    if (top === null || p.value > top.value) top = p;
  }
  return top;
}

/**
 * Deterministic insights computed from the data — descriptive, never advisory.
 * AI-generated insights arrive with the AI Tutor module.
 * // AI-generated insights arrive with the AI Tutor module
 */
function buildInsights(closed: ReadonlyArray<TradeRow>, series: AnalyticsSeries): AnalyticsInsight[] {
  const out: AnalyticsInsight[] = [];

  const bestSession = best(series.winRateBySession);
  if (bestSession) {
    out.push({
      id: 'best-session',
      text: `Your strongest session in this period is ${bestSession.label}, with a ${bestSession.value}% win rate across your logged trades.`,
    });
  }

  const bestSetup = best(series.avgRBySetup);
  if (bestSetup && bestSetup.value > 0) {
    out.push({
      id: 'best-setup',
      text: `Your highest-expectancy setup is ${bestSetup.label} at ${formatR(bestSetup.value)} average across the trades you tagged with it.`,
    });
  }

  // Loss clusters: which day of week has the lowest win rate (a leak to review).
  const worstDow = series.winRateByDayOfWeek.reduce<SeriesPoint | null>(
    (lowest, p) => (lowest === null || p.value < lowest.value ? p : lowest),
    null,
  );
  if (worstDow && series.winRateByDayOfWeek.length > 1) {
    out.push({
      id: 'loss-cluster',
      text: `Losses cluster on ${worstDow.label} in this period — its ${worstDow.value}% win rate sits below your other days. Worth reviewing your notes there.`,
    });
  }

  if (out.length === 0 && closed.length > 0) {
    out.push({
      id: 'keep-logging',
      text: 'Keep logging trades with sessions and setups tagged — patterns by session, day and setup become visible as your sample grows.',
    });
  }

  return out;
}

// ── Entry point ──────────────────────────────────────────────────────────

/**
 * Compute the full analytics view-model from the caller's trade rows.
 * `rows` should already exclude open/draft trades unless the caller's toggle
 * opted them in; this function additionally drops any non-closed rows from the
 * realized-R math so the numbers are always defensible.
 *
 * @param _now injectable clock for deterministic tests. Reserved for
 *   date-window insights so the signature stays stable as those land; the
 *   date-range query itself is applied server-side in `page.tsx`.
 */
export function analyze(
  rows: ReadonlyArray<TradeRow>,
  _now: number = Date.now(),
): Analytics {
  const closed = closedTrades(rows);
  const summary = buildSummary(closed);
  const series = buildSeries(closed);
  const insights = buildInsights(closed, series);

  return {
    summary,
    series,
    insights,
    empty: closed.length === 0,
  };
}
