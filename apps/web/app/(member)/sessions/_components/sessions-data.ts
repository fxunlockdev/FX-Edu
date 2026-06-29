/**
 * Live Webinars & Replays (M8 / PROJECT.md §8.6) — typed seed dataset.
 *
 * This is the DEGRADE-GRACEFULLY fallback the page renders today. Once the
 * `webinars` / `webinar_recordings` tables ship, the RSC reads them through the
 * RLS-scoped server client and maps rows onto these same types; if that read
 * fails (table not deployed) we fall back to this seed so the screen never
 * errors (the dashboard/analytics modules use the identical pattern).
 *
 * Times are anchored RELATIVE to module load so the "next live" hero always has
 * a future target and one session reads as live during local dev. Helpers below
 * are pure and total.
 */

import type { LiveSession, Replay } from './sessions-types';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Anchor used to derive relative session times (stable per server process). */
const ANCHOR = Date.now();

function iso(offsetMs: number): string {
  return new Date(ANCHOR + offsetMs).toISOString();
}

/**
 * Seed sessions, ordered soonest-first. The first entry is anchored to be LIVE
 * NOW (started a few minutes ago, ends within the hour) so the live-join gate is
 * exercisable in dev; the rest are upcoming across the week.
 */
export const LIVE_SESSIONS: readonly LiveSession[] = Object.freeze([
  {
    id: 'london-structure-liquidity',
    title: 'London Session Structure & Liquidity',
    host: 'Marcus Vale',
    topic: 'Technical analysis',
    startsAt: iso(-8 * 60 * 1000), // started 8 min ago → live
    endsAt: iso(52 * 60 * 1000),
    timezoneLabel: 'GMT',
    access: 'pro',
    registration: 'reserved',
    summary:
      'How the London open re-prices overnight ranges — reading structure and liquidity, framed as a process, not a call.',
    registeredCount: 312,
  },
  {
    id: 'reading-economic-calendar',
    title: 'Reading the Economic Calendar',
    host: 'Dana Cole',
    topic: 'Fundamental analysis',
    startsAt: iso(2 * DAY_MS + 6 * HOUR_MS),
    endsAt: iso(2 * DAY_MS + 7 * HOUR_MS),
    timezoneLabel: 'GMT',
    access: 'free',
    registration: 'open',
    summary:
      'A repeatable routine for prepping around scheduled data releases and managing exposure into volatility.',
    registeredCount: 188,
  },
  {
    id: 'pre-trade-routine',
    title: 'Building a Pre-Trade Routine',
    host: 'Priya Anand',
    topic: 'Mindset',
    startsAt: iso(4 * DAY_MS + 9 * HOUR_MS),
    endsAt: iso(4 * DAY_MS + 10 * HOUR_MS),
    timezoneLabel: 'GMT',
    access: 'free',
    registration: 'open',
    summary:
      'Designing a checklist-driven pre-session routine to keep decisions consistent and rule-based.',
    registeredCount: 96,
  },
  {
    id: 'risk-first-position-sizing',
    title: 'Risk-First Position Sizing',
    host: 'Marcus Vale',
    topic: 'Technical analysis',
    startsAt: iso(6 * DAY_MS + 6 * HOUR_MS),
    endsAt: iso(6 * DAY_MS + 7 * HOUR_MS),
    timezoneLabel: 'GMT',
    access: 'pro',
    registration: 'open',
    summary:
      'Sizing from a fixed risk budget first — an educational walk-through of the arithmetic, never a directive.',
    registeredCount: 141,
  },
]);

/** Pro replay library — processed recordings with transcript + AI summary. */
export const REPLAYS: readonly Replay[] = Object.freeze([
  {
    id: 'market-structure-masterclass',
    title: 'Market Structure Masterclass',
    host: 'Marcus Vale',
    topic: 'Technical analysis',
    durationMin: 58,
    hasTranscript: true,
    aiSummary:
      'Defines swing structure, break-of-structure and the difference between a pullback and a reversal, with a checklist for classifying the current leg.',
    publishedAt: iso(-7 * DAY_MS),
  },
  {
    id: 'nfp-trading-news-safely',
    title: 'NFP: Trading the News Safely',
    host: 'Dana Cole',
    topic: 'Fundamental analysis',
    durationMin: 44,
    hasTranscript: true,
    aiSummary:
      'Covers why spreads widen around the release, how to pre-define exposure rules, and a disciplined wait-for-confirmation routine.',
    publishedAt: iso(-12 * DAY_MS),
  },
  {
    id: 'discipline-losing-streak',
    title: 'Discipline & The Losing Streak',
    host: 'Priya Anand',
    topic: 'Mindset',
    durationMin: 51,
    hasTranscript: true,
    aiSummary:
      'A framework for separating process from outcome, journaling through drawdown, and protecting decision quality when results dip.',
    publishedAt: iso(-16 * DAY_MS),
  },
  {
    id: 'liquidity-sweeps-explained',
    title: 'Liquidity Sweeps Explained',
    host: 'Marcus Vale',
    topic: 'Technical analysis',
    durationMin: 39,
    hasTranscript: true,
    aiSummary:
      'Explains where resting liquidity tends to sit and how to document a sweep-and-reclaim idea as a testable, rule-based observation.',
    publishedAt: iso(-21 * DAY_MS),
  },
  {
    id: 'central-banks-currency-flows',
    title: 'Central Banks & Currency Flows',
    host: 'Dana Cole',
    topic: 'Fundamental analysis',
    durationMin: 47,
    hasTranscript: false,
    aiSummary:
      'Walks through how rate-path expectations shape relative currency strength and how to track the macro backdrop for context.',
    publishedAt: iso(-26 * DAY_MS),
  },
  {
    id: 'journaling-for-edge',
    title: 'Journaling for Edge',
    host: 'Priya Anand',
    topic: 'Mindset',
    durationMin: 33,
    hasTranscript: true,
    aiSummary:
      'Shows how to structure trade-journal entries so review surfaces repeatable strengths and leaks instead of noise.',
    publishedAt: iso(-30 * DAY_MS),
  },
]);

/**
 * Choose the "next live" hero session: a currently-live one if present,
 * otherwise the soonest upcoming. Returns `null` only if the list is empty.
 * Pure — caller passes the clock.
 */
export function nextLiveSession(
  sessions: readonly LiveSession[],
  now: number,
): LiveSession | null {
  if (sessions.length === 0) return null;

  const live = sessions.find((s) => {
    const start = Date.parse(s.startsAt);
    const end = Date.parse(s.endsAt);
    return !Number.isNaN(start) && !Number.isNaN(end) && now >= start && now < end;
  });
  if (live) return live;

  const upcoming = sessions
    .filter((s) => {
      const start = Date.parse(s.startsAt);
      return !Number.isNaN(start) && start > now;
    })
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

  return upcoming[0] ?? sessions[0] ?? null;
}
