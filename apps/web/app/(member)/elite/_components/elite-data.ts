/**
 * Static, education-only sample data for Elite Cohort & Coaching (M21 /
 * PROJECT.md §9 module 21). None of this is live — coaching calls, answered
 * questions, and early-access content are illustrative placeholders that render
 * only inside the Elite gate (or as previews on the waitlist surface). When the
 * Elite backend lands these arrays are replaced by RLS-scoped reads.
 *
 * COPY POLICY (§6.7): everything here is framed as education and skill-building.
 * No profit claims, no signals, no guarantee of any trading or evaluation outcome.
 */

/** What Elite adds on top of Pro — the value proposition, framed as education. */
export interface EliteBenefit {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  /** Short label for the leading marker (kept text, not an icon font). */
  readonly marker: string;
}

export const ELITE_BENEFITS: ReadonlyArray<EliteBenefit> = [
  {
    id: 'coaching',
    marker: 'Live',
    title: 'Monthly live coaching calls',
    detail:
      'Small-group sessions with an educator to review your process, journal habits, and risk discipline — a teaching format, never trade signals.',
  },
  {
    id: 'qa',
    marker: 'Q&A',
    title: 'Direct educator Q&A',
    detail:
      'Ask the things courses do not cover. Questions are answered by educators and added to a searchable, Elite-only knowledge base.',
  },
  {
    id: 'early',
    marker: 'New',
    title: 'Early access to content',
    detail:
      'See new courses, lessons, and workshops before they reach Pro — and help shape them with your feedback.',
  },
  {
    id: 'cohort',
    marker: 'Pod',
    title: 'A smaller, high-touch cohort',
    detail:
      'Learn alongside a capped group of committed members so coaching stays personal and accountable.',
  },
  {
    id: 'propprep',
    marker: 'Prep',
    title: 'Prop-firm prep track',
    detail:
      'Coaching tailored to a funded-account evaluation: modelling drawdown rules and drilling the discipline to stay inside them. Preparation only — never a guarantee of passing.',
  },
];

/** An upcoming live coaching call. */
export interface CoachingCall {
  readonly id: string;
  readonly topic: string;
  readonly host: string;
  /** ISO 8601 instant for the session start (UTC). Formatted for display server-side. */
  readonly startsAtIso: string;
  /** IANA-ish display timezone label shown next to the localized time. */
  readonly tzLabel: string;
  /** Approx. session length, e.g. "60 min". */
  readonly duration: string;
  /** Capped seat framing for the high-touch cohort. */
  readonly seats: string;
}

export const COACHING_CALLS: ReadonlyArray<CoachingCall> = [
  {
    id: 'cc-2026-07',
    topic: 'Building a repeatable pre-session routine',
    host: 'Lena Ortiz',
    startsAtIso: '2026-07-08T17:00:00Z',
    tzLabel: 'UTC',
    duration: '60 min',
    seats: '12 seats',
  },
  {
    id: 'cc-2026-08',
    topic: 'Reviewing your journal: turning losses into rules',
    host: 'Marcus Bell',
    startsAtIso: '2026-08-05T16:00:00Z',
    tzLabel: 'UTC',
    duration: '75 min',
    seats: '12 seats',
  },
  {
    id: 'cc-2026-09',
    topic: 'Risk discipline under evaluation pressure',
    host: 'Lena Ortiz',
    startsAtIso: '2026-09-09T17:00:00Z',
    tzLabel: 'UTC',
    duration: '60 min',
    seats: '12 seats',
  },
];

/** A previously answered educator Q&A entry. */
export interface AnsweredQuestion {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly answeredBy: string;
  /** Display date string (already human-readable; sample data). */
  readonly answeredOn: string;
  readonly topic: string;
}

export const ANSWERED_QUESTIONS: ReadonlyArray<AnsweredQuestion> = [
  {
    id: 'q-routine',
    topic: 'Process',
    question: 'How do I stop over-trading after a losing morning?',
    answer:
      'Treat it as a rules problem, not a willpower problem. Set a hard daily-loss cap before you start, journal the emotional trigger when it fires, and review the pattern on your coaching call. The goal is a repeatable routine, not a perfect day.',
    answeredBy: 'Lena Ortiz',
    answeredOn: 'May 2026',
  },
  {
    id: 'q-position',
    topic: 'Risk',
    question: 'Should position size change after a winning streak?',
    answer:
      'Your per-trade risk should be a fixed function of your plan, independent of recent results. We cover how to size from the Risk Calculator and keep it constant so a streak never quietly inflates your exposure. This is education, not a recommendation to trade.',
    answeredBy: 'Marcus Bell',
    answeredOn: 'Apr 2026',
  },
  {
    id: 'q-prep',
    topic: 'Prop prep',
    question: 'What is the most common reason people fail an evaluation?',
    answer:
      'Risk-rule violations, not weak analysis — a single oversized day breaches the drawdown limit. The prep track drills staying inside the limits you configure. It builds discipline; it cannot and does not guarantee a pass.',
    answeredBy: 'Lena Ortiz',
    answeredOn: 'Mar 2026',
  },
];

/** An early-access content item visible to Elite ahead of Pro. */
export interface EarlyAccessItem {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  /** Format label, e.g. "Course", "Workshop", "Lesson". */
  readonly format: string;
  /** When it reaches Pro — frames the Elite head-start. */
  readonly proRelease: string;
}

export const EARLY_ACCESS: ReadonlyArray<EarlyAccessItem> = [
  {
    id: 'ea-orderflow',
    title: 'Reading order flow without the hype',
    summary:
      'A grounded look at what order-flow tools can and cannot tell you, with worked examples.',
    format: 'Course',
    proRelease: 'Pro: Aug 2026',
  },
  {
    id: 'ea-journal-clinic',
    title: 'Journal clinic: live teardown workshop',
    summary:
      'A recorded workshop reviewing anonymized member journals to extract repeatable rules.',
    format: 'Workshop',
    proRelease: 'Pro: Sep 2026',
  },
  {
    id: 'ea-psychology',
    title: 'Trading psychology: the discipline loop',
    summary:
      'A short lesson series on building the feedback loop between plan, execution, and review.',
    format: 'Lesson series',
    proRelease: 'Pro: Oct 2026',
  },
];

/**
 * Format an ISO instant for display. Deterministic across server renders: we
 * format in UTC and pair it with the source `tzLabel`, so there is no
 * server/client locale drift (the value is the same on every render).
 */
export function formatCallTime(startsAtIso: string, tzLabel: string): string {
  const date = new Date(startsAtIso);
  if (Number.isNaN(date.getTime())) {
    return 'Time to be announced';
  }
  const formatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
  return `${formatted} ${tzLabel}`;
}
