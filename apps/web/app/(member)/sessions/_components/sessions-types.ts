/**
 * Live Webinars & Replays (M8 / PROJECT.md §8.6) — domain types + pure,
 * defensive plan/lock/state helpers.
 *
 * The seed dataset lives in {@link ./sessions-data}. Keeping the types and the
 * total, I/O-free helpers here keeps the data file focused on content and every
 * file under the 400-line cap.
 *
 * Educational framing only: webinars teach a repeatable, rule-based process.
 * Nothing here is a signal, a trade recommendation, or a profit claim
 * (PROJECT.md §6.7). Copy is written accordingly.
 */

/**
 * Subscription plan literal. Mirrors `@fxunlock/entitlements`'s `Plan` without
 * taking a hard package dependency before the entitlements read is wired. The
 * sessions screen distinguishes Basic (Pro sessions + the replay library are
 * locked) from Pro/Elite (everything unlocked).
 *
 * TODO: read plan from /entitlements — replace {@link resolvePlan} with the real
 * server-side entitlement read once the API route exists. Until then we default
 * to the most restrictive plan so paid content is never leaked by the UI.
 */
export type Plan = 'basic' | 'pro' | 'elite';

/** Educational topic taxonomy (PROJECT.md §8.6 educator session creation). */
export type SessionTopic = 'Technical analysis' | 'Fundamental analysis' | 'Mindset';

/** Minimum plan required to register for / join a session or open a replay. */
export type AccessLevel = 'free' | 'pro' | 'elite';

/** Lifecycle of a scheduled session relative to "now". */
export type SessionStatus = 'live' | 'upcoming' | 'ended';

/** Whether the current viewer is registered for a given session. */
export type RegistrationState = 'reserved' | 'open';

/**
 * A live/scheduled webinar. `startsAt`/`endsAt` are ISO-8601 UTC instants — all
 * lifecycle math derives from them so the UI never trusts a precomputed flag.
 */
export interface LiveSession {
  readonly id: string;
  readonly title: string;
  readonly host: string;
  readonly topic: SessionTopic;
  /** ISO-8601 UTC start instant. */
  readonly startsAt: string;
  /** ISO-8601 UTC end instant. */
  readonly endsAt: string;
  /** IANA-ish display timezone label shown to the member (e.g. "GMT"). */
  readonly timezoneLabel: string;
  /** Minimum plan required to join the live stream. */
  readonly access: AccessLevel;
  /** Whether the viewer has reserved a seat (seed default). */
  readonly registration: RegistrationState;
  /** One-line teaser describing what the session teaches. */
  readonly summary: string;
  /** Registered head-count surfaced as social proof (educational, not a claim). */
  readonly registeredCount: number;
}

/** A processed recording in the Pro replay library. */
export interface Replay {
  readonly id: string;
  readonly title: string;
  readonly host: string;
  readonly topic: SessionTopic;
  /** Runtime in whole minutes. */
  readonly durationMin: number;
  /** Whether a machine transcript is attached (worker output — STUBBED). */
  readonly hasTranscript: boolean;
  /** Short AI-generated study summary (worker output — STUBBED copy in seed). */
  readonly aiSummary: string;
  /** Publish date, ISO-8601. */
  readonly publishedAt: string;
}

/** A topic filter tab: label + the topic it maps to (`null` = All). */
export interface TopicTab {
  readonly label: string;
  readonly topic: SessionTopic | null;
}

/** Replay-library topic filter tabs (PROJECT.md §8.6 ✨ topic filter). */
export const TOPIC_TABS: readonly TopicTab[] = Object.freeze([
  { label: 'All topics', topic: null },
  { label: 'Technical', topic: 'Technical analysis' },
  { label: 'Fundamental', topic: 'Fundamental analysis' },
  { label: 'Mindset', topic: 'Mindset' },
]);

/**
 * Resolve the active topic filter from a raw URL search-param value. Unknown /
 * missing values fall back to "All" (`null`) — never throws.
 */
export function resolveTopic(raw: string | undefined): SessionTopic | null {
  if (!raw) return null;
  const match = TOPIC_TABS.find((t) => t.topic === raw);
  return match?.topic ?? null;
}

/** Filter replays to a topic (or all when `topic` is `null`). Pure + total. */
export function filterByTopic(
  replays: readonly Replay[],
  topic: SessionTopic | null,
): readonly Replay[] {
  if (topic === null) return replays;
  return replays.filter((r) => r.topic === topic);
}

/**
 * Defensive plan resolution. Until the real `/entitlements` read is wired, this
 * always returns the most restrictive plan so the UI never *grants* access it
 * cannot prove. Server-side authorization remains the real gate — the UI lock is
 * a hint only (PROJECT.md §6.1).
 *
 * Accepts an optional already-resolved plan (e.g. from a future entitlement
 * fetch) and validates it; anything unrecognized degrades to `'basic'`.
 *
 * TODO: read plan from /entitlements — call the entitlement service here and map
 * its `Plan` onto this literal.
 */
export function resolvePlan(candidate?: string | null): Plan {
  if (candidate === 'pro' || candidate === 'elite') return candidate;
  return 'basic';
}

/** Plan rank for "does plan X satisfy access level Y" comparisons. */
const PLAN_RANK: Record<Plan, number> = { basic: 0, pro: 1, elite: 2 };
const ACCESS_RANK: Record<AccessLevel, number> = { free: 0, pro: 1, elite: 2 };

/**
 * Whether `plan` is entitled to a given access level. A `'free'` session is open
 * to everyone; `'pro'`/`'elite'` require at least that tier. Pure and total.
 */
export function isEntitled(plan: Plan, access: AccessLevel): boolean {
  return PLAN_RANK[plan] >= ACCESS_RANK[access];
}

/**
 * Derive a session's lifecycle status from its window and the current instant.
 * Total: any clock value yields exactly one of live / upcoming / ended.
 */
export function sessionStatus(session: LiveSession, now: number): SessionStatus {
  const start = Date.parse(session.startsAt);
  const end = Date.parse(session.endsAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return 'ended';
  if (now >= end) return 'ended';
  if (now >= start) return 'live';
  return 'upcoming';
}

/** The reason a Join-live button is disabled (or `null` when it's enabled). */
export type JoinBlockReason =
  | 'not-live'
  | 'plan-locked'
  | null;

/**
 * Decide whether the viewer may join the live stream, and if not, why.
 *
 * IMPORTANT: this is a UI HINT only. The authoritative gate is server-side —
 * `GET /webinars/:id/join-token` must re-check the entitlement before minting a
 * signed Mux playback token (PROJECT.md §6.1, §8.6 🔒). A Basic member who
 * forges this flag still cannot obtain a token.
 *
 * Joinable requires BOTH conditions:
 *  1. the session is currently live, AND
 *  2. the viewer's plan is entitled to the session's access level.
 */
export function joinDecision(
  session: LiveSession,
  plan: Plan,
  now: number,
): { canJoin: boolean; reason: JoinBlockReason } {
  if (sessionStatus(session, now) !== 'live') {
    return { canJoin: false, reason: 'not-live' };
  }
  if (!isEntitled(plan, session.access)) {
    return { canJoin: false, reason: 'plan-locked' };
  }
  return { canJoin: true, reason: null };
}

/** Human-readable label for an access level, for badges. */
export function accessLabel(access: AccessLevel): string {
  if (access === 'free') return 'Free';
  if (access === 'pro') return 'Pro';
  return 'Elite';
}

/** Reminder cadence shown to members (PROJECT.md §8.6: confirm/24h/1h/30m). */
export const REMINDER_SCHEDULE: readonly string[] = Object.freeze([
  'Confirmation email the moment you reserve',
  '24 hours before — a heads-up with the agenda',
  '1 hour before — your join link goes live',
  '30 minutes before — final reminder to settle in',
]);
