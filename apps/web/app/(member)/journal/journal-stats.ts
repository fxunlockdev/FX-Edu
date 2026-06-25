/**
 * Pure journal-summary math (PROJECT.md §8.8 summary metrics). No I/O — takes
 * the user's trade rows and a "now" reference and returns the headline figures:
 * trades this week, win rate, avg R:R, net R (30d), best pair, avg emotion.
 *
 * v1 CLIENT/SERVER-LIGHT computation: PROJECT.md §8.8 calls for stats to be
 * recomputed server-side by workers (`analytics_snapshots`). Until that worker
 * lands we derive the headline numbers directly from the user's own RLS-scoped
 * rows so the journal is useful immediately. The figures are framed as the
 * user's logged history, never as performance guarantees.
 */
import { formatR, toNumber, type TradeRow } from './trade-fields';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface JournalSummary {
  readonly tradesThisWeek: string;
  readonly winRate: string;
  readonly avgRR: string;
  readonly netR30d: string;
  readonly bestPair: string;
  readonly avgEmotion: string;
  /** True when there are no trades yet — drives the empty state. */
  readonly empty: boolean;
}

function rowTime(row: TradeRow): number {
  const stamp = row.closed_at ?? row.opened_at ?? row.created_at;
  const t = stamp ? Date.parse(stamp) : NaN;
  return Number.isFinite(t) ? t : NaN;
}

export function summarize(rows: ReadonlyArray<TradeRow>, now: number = Date.now()): JournalSummary {
  if (rows.length === 0) {
    return {
      tradesThisWeek: '0',
      winRate: '—',
      avgRR: '—',
      netR30d: '0.0R',
      bestPair: '—',
      avgEmotion: '—',
      empty: true,
    };
  }

  const weekAgo = now - 7 * DAY_MS;
  const monthAgo = now - 30 * DAY_MS;

  let tradesThisWeek = 0;
  let wins = 0;
  let decided = 0; // win + loss + breakeven (excludes open) for win-rate denominator
  let rrSum = 0;
  let rrCount = 0;
  let netR30 = 0;
  let emotionSum = 0;
  let emotionCount = 0;

  const netRByPair = new Map<string, number>();

  for (const row of rows) {
    const t = rowTime(row);
    if (Number.isFinite(t) && t >= weekAgo) tradesThisWeek += 1;

    if (row.result === 'win' || row.result === 'loss' || row.result === 'breakeven') {
      decided += 1;
      if (row.result === 'win') wins += 1;
    }

    const r = toNumber(row.r_multiple);
    if (r !== null && row.result !== 'open') {
      // Avg R:R uses the magnitude of realized R (reward-to-risk realized).
      rrSum += Math.abs(r);
      rrCount += 1;
      if (Number.isFinite(t) && t >= monthAgo) {
        netR30 += r;
        netRByPair.set(row.instrument, (netRByPair.get(row.instrument) ?? 0) + r);
      }
    }

    if (row.emotion !== null && row.emotion !== undefined) {
      emotionSum += row.emotion;
      emotionCount += 1;
    }
  }

  let bestPair = '—';
  let bestPairR = -Infinity;
  for (const [pair, total] of netRByPair) {
    if (total > bestPairR) {
      bestPairR = total;
      bestPair = pair;
    }
  }

  return {
    tradesThisWeek: String(tradesThisWeek),
    winRate: decided > 0 ? `${Math.round((wins / decided) * 100)}%` : '—',
    avgRR: rrCount > 0 ? (rrSum / rrCount).toFixed(1) : '—',
    netR30d: formatR(netR30),
    bestPair,
    avgEmotion: emotionCount > 0 ? `${(emotionSum / emotionCount).toFixed(1)} / 10` : '—',
    empty: false,
  };
}
