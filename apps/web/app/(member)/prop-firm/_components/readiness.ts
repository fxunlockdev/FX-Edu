/**
 * Pure readiness model for Prop Firm Prep (M13 / PROJECT.md §8.13).
 *
 * Prop evaluations are lost to *risk violations*, not bad analysis — so this
 * model scores the discipline an evaluation actually grades, derived only from
 * the user's own logged trades. It is intentionally honest: it measures the
 * habits that keep an account inside its limits, and it NEVER predicts or
 * guarantees passing an evaluation. The score is a behavioral readiness read,
 * not a verdict (PROJECT.md §8.13 — "no pass guarantees").
 *
 * Pure and total, mirroring the trading package and `journal-stats`: it takes
 * the user's trade rows plus a fixed `now` reference and returns a view-model.
 * No I/O, no clock reads, no mutation. Degrades to a clearly-labeled empty
 * read when there are not enough trades to say anything meaningful.
 */
import { toNumber, type TradeRow } from '../../journal/trade-fields';

/** Per-trade risk we treat as "disciplined" for a prop evaluation. */
export const DISCIPLINED_RISK_PERCENT = 1;

/** Minimum decided trades before a numeric score is meaningful. */
export const MIN_TRADES_FOR_SCORE = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

/** A single weighted signal that contributes to the overall readiness score. */
export interface ReadinessSignal {
  readonly id: 'risk-discipline' | 'journaling-consistency' | 'win-stability' | 'planning-habit';
  readonly label: string;
  /** 0–100 sub-score for this signal. */
  readonly score: number;
  /** Relative weight in the overall score (weights sum to 1). */
  readonly weight: number;
  /** Plain-English, non-advisory explanation of what was measured. */
  readonly detail: string;
}

/** The fully-derived readiness view-model handed to the page. */
export interface Readiness {
  /** Overall 0–100 readiness score (rounded). 0 when `empty`. */
  readonly score: number;
  /** Letter band derived from the score (A+ … D), or '—' when empty. */
  readonly band: string;
  /** One-line, non-advisory summary of the current state. */
  readonly summary: string;
  /** The weighted signals that produced the score. */
  readonly signals: readonly ReadinessSignal[];
  /** How many decided (win/loss/breakeven) trades fed the score. */
  readonly tradesConsidered: number;
  /**
   * True when there are too few trades to compute a meaningful score. The page
   * shows a "log more trades" prompt instead of a misleadingly precise number.
   */
  readonly empty: boolean;
}

function rowTime(row: TradeRow): number {
  const stamp = row.closed_at ?? row.opened_at ?? row.created_at;
  const t = stamp ? Date.parse(stamp) : NaN;
  return Number.isFinite(t) ? t : NaN;
}

function isDecided(row: TradeRow): boolean {
  return row.result === 'win' || row.result === 'loss' || row.result === 'breakeven';
}

/** Map an absolute risk fraction to a 0–100 discipline contribution. */
function riskSubScore(rows: ReadonlyArray<TradeRow>): { score: number; withinPct: number } {
  // We can only judge risk discipline on trades whose risk we can read. R is the
  // realized return in units of risk; a |loss| > 1R means the stop slipped past
  // the planned 1R, i.e. risk exceeded the disciplined cap on that trade.
  const losses = rows.filter((r) => r.result === 'loss' && toNumber(r.r_multiple) !== null);
  if (losses.length === 0) {
    // No realized losses to inspect — neutral-positive read, clearly flagged.
    return { score: 60, withinPct: 0 };
  }
  const within = losses.filter((r) => {
    const r1 = toNumber(r.r_multiple);
    return r1 !== null && Math.abs(r1) <= DISCIPLINED_RISK_PERCENT + 1e-9;
  }).length;
  const withinPct = Math.round((within / losses.length) * 100);
  return { score: withinPct, withinPct };
}

/** How consistently the user journals (decided-result + emotion completeness). */
function journalingSubScore(rows: ReadonlyArray<TradeRow>): { score: number; logged: number } {
  if (rows.length === 0) return { score: 0, logged: 0 };
  const decided = rows.filter(isDecided).length;
  const withEmotion = rows.filter((r) => r.emotion !== null && r.emotion !== undefined).length;
  // Two completeness ratios, averaged: did you record an outcome, and did you
  // record how you felt (the reflective habit prop firms reward).
  const decidedRatio = decided / rows.length;
  const emotionRatio = withEmotion / rows.length;
  return { score: Math.round(((decidedRatio + emotionRatio) / 2) * 100), logged: rows.length };
}

/**
 * Win-rate stability: reward steadiness, not a high win rate. We compare the
 * win rate of the most recent half of decided trades against the older half;
 * a small gap (consistent behavior) scores higher than a volatile swing.
 */
function stabilitySubScore(rows: ReadonlyArray<TradeRow>): { score: number } {
  const decided = rows
    .filter(isDecided)
    .map((r) => ({ t: rowTime(r), win: r.result === 'win' }))
    .filter((d) => Number.isFinite(d.t))
    .sort((a, b) => a.t - b.t);

  if (decided.length < 4) {
    // Not enough to judge a trend — neutral read.
    return { score: 55 };
  }
  const mid = Math.floor(decided.length / 2);
  const older = decided.slice(0, mid);
  const recent = decided.slice(mid);
  const rate = (arr: { win: boolean }[]) => arr.filter((d) => d.win).length / arr.length;
  const swing = Math.abs(rate(recent) - rate(older)); // 0 (stable) … 1 (volatile)
  return { score: Math.round((1 - swing) * 100) };
}

/**
 * Planning habit: did the trade carry the artifacts of a written plan (a setup
 * tag and a defined take-profit)? A planned trade is the routine an evaluation
 * rewards. Measured across all rows, not just decided ones.
 */
function planningSubScore(rows: ReadonlyArray<TradeRow>): { score: number } {
  if (rows.length === 0) return { score: 0 };
  const planned = rows.filter((r) => {
    const hasSetup = typeof r.setup === 'string' && r.setup.trim() !== '';
    const hasTarget = toNumber(r.take_profit) !== null;
    return hasSetup && hasTarget;
  }).length;
  return { score: Math.round((planned / rows.length) * 100) };
}

function bandFor(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

function summaryFor(score: number): string {
  if (score >= 80) return 'Your logged habits show strong evaluation discipline.';
  if (score >= 60) return 'Your discipline is taking shape — a few habits still need tightening.';
  return 'Your logged trades show discipline gaps worth closing before an evaluation.';
}

/**
 * Compute a readiness read from the user's trade history.
 *
 * @param rows  RLS-scoped trade rows for the signed-in user.
 * @param now   Reference time (defaults to `Date.now()`); passed in tests for
 *              determinism. Reserved for time-windowed signals.
 */
export function computeReadiness(
  rows: ReadonlyArray<TradeRow>,
  now: number = Date.now(),
): Readiness {
  void now; // reserved for future time-windowed weighting; keeps the API stable.

  const decidedCount = rows.filter(isDecided).length;

  if (decidedCount < MIN_TRADES_FOR_SCORE) {
    return {
      score: 0,
      band: '—',
      summary: 'Log a few more trades to see your readiness read.',
      signals: [],
      tradesConsidered: decidedCount,
      empty: true,
    };
  }

  const risk = riskSubScore(rows);
  const journaling = journalingSubScore(rows);
  const stability = stabilitySubScore(rows);
  const planning = planningSubScore(rows);

  const signals: ReadinessSignal[] = [
    {
      id: 'risk-discipline',
      label: 'Risk discipline',
      score: risk.score,
      weight: 0.4,
      detail:
        risk.withinPct > 0
          ? `${risk.withinPct}% of your realized losses stayed within a 1R (≤1% risk) cap.`
          : 'No realized losses logged yet to measure against a 1% risk cap.',
    },
    {
      id: 'journaling-consistency',
      label: 'Journaling consistency',
      score: journaling.score,
      weight: 0.25,
      detail: `Outcome and emotion logged across ${journaling.logged} recent trades.`,
    },
    {
      id: 'win-stability',
      label: 'Win-rate stability',
      score: stability.score,
      weight: 0.2,
      detail: 'How steady your win rate is between your earlier and recent trades.',
    },
    {
      id: 'planning-habit',
      label: 'Planning habit',
      score: planning.score,
      weight: 0.15,
      detail: 'Share of trades carrying a written setup and a defined target.',
    },
  ];

  const weighted = signals.reduce((sum, s) => sum + s.score * s.weight, 0);
  const score = Math.max(0, Math.min(100, Math.round(weighted)));

  return {
    score,
    band: bandFor(score),
    summary: summaryFor(score),
    signals,
    tradesConsidered: decidedCount,
    empty: false,
  };
}
