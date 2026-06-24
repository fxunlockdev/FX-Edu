// Static webinar content for the Webinars landing page.
// Educational framing only — no financial advice or profit claims.

export type Access = 'Free' | 'Pro';
export type SessionType = 'Technical' | 'Fundamental' | 'Mindset';

export interface UpcomingSession {
  readonly type: SessionType;
  readonly title: string;
  readonly host: string;
  readonly when: string;
  readonly access: Access;
}

export interface SessionFormat {
  readonly title: string;
  readonly desc: string;
}

export interface NextSession {
  readonly title: string;
  readonly host: string;
  readonly hostInitials: string;
  readonly hostRole: string;
  readonly summary: string;
  readonly when: string;
  /** ISO 8601 instant the live countdown targets. */
  readonly startsAt: string;
}

/** The headlined "next live" session shown in the hero card. */
export const NEXT_SESSION: NextSession = {
  title: 'London Session Structure & Liquidity',
  host: 'Marcus Vale',
  hostInitials: 'MV',
  hostRole: 'Lead Technical Educator',
  summary:
    'Marcus Vale walks through pre-London planning, liquidity pools, and session-based entries — as an educational study of market structure.',
  when: 'Thu · 18:00 GMT',
  // Fixed reference instant so server + client render deterministically.
  startsAt: '2026-06-25T18:00:00Z',
};

export const UPCOMING_SESSIONS: ReadonlyArray<UpcomingSession> = [
  {
    type: 'Technical',
    title: 'London Session Structure & Liquidity',
    host: 'Marcus Vale',
    when: 'Thu · 18:00 GMT',
    access: 'Free',
  },
  {
    type: 'Fundamental',
    title: 'Reading the Macro Calendar',
    host: 'Dr. Lena Hoff',
    when: 'Fri · 16:00 GMT',
    access: 'Pro',
  },
  {
    type: 'Mindset',
    title: 'Beating Revenge Trading',
    host: 'Sofia Marin',
    when: 'Mon · 19:00 GMT',
    access: 'Pro',
  },
] as const;

export const SESSION_FORMATS: ReadonlyArray<SessionFormat> = [
  {
    title: 'Technical analysis',
    desc: 'Market structure, session-based setups, and live chart breakdowns.',
  },
  {
    title: 'Fundamental analysis',
    desc: 'Macro drivers, the economic calendar, and interpreting the news.',
  },
  {
    title: 'Mindset',
    desc: 'Discipline, bias, revenge trading, and process over outcome.',
  },
] as const;

export const REPLAY_HIGHLIGHTS: ReadonlyArray<string> = [
  'Every session recorded in full HD',
  'Searchable transcripts for each replay',
  'AI summaries with key takeaways',
] as const;
