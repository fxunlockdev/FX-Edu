import { describe, expect, it } from 'vitest';
import {
  accessLabel,
  filterByTopic,
  isEntitled,
  joinDecision,
  resolvePlan,
  resolveTopic,
  sessionStatus,
  type LiveSession,
  type Plan,
} from './sessions-types';
import { LIVE_SESSIONS, REPLAYS, nextLiveSession } from './sessions-data';
import { buildGoogleCalendarUrl, buildIcs } from './calendar';

/**
 * Live Webinars & Replays pure-logic tests (M8 / PROJECT.md §8.6). Deterministic,
 * no I/O. The entitlement-gated JOIN decision is the security-relevant surface:
 * the UI must never *grant* live access it cannot prove — a Pro-only live stream
 * must be unjoinable by Basic (real enforcement is the server-side join-token
 * route; this guards the hint). Those cases are the priority.
 */

const HOUR = 60 * 60 * 1000;

/** Build a session whose window is offset (in ms) from a fixed `now`. */
function sessionAt(
  startOffset: number,
  endOffset: number,
  access: LiveSession['access'],
): LiveSession {
  const now = 1_000_000_000_000;
  return {
    id: 'test',
    title: 'Test Session',
    host: 'Host',
    topic: 'Technical analysis',
    startsAt: new Date(now + startOffset).toISOString(),
    endsAt: new Date(now + endOffset).toISOString(),
    timezoneLabel: 'GMT',
    access,
    registration: 'open',
    summary: 'A test session.',
    registeredCount: 1,
  };
}
const NOW = 1_000_000_000_000;

describe('resolvePlan — defensive default', () => {
  it('defaults to basic when nothing is provided', () => {
    expect(resolvePlan()).toBe('basic');
  });

  it('defaults to basic for unknown / malformed input (incl. literal "basic")', () => {
    // 'basic' is the defensive fallback, not a recognized branch — same path
    // as any unrecognized value. Asserting it here keeps the intent honest.
    expect(resolvePlan(null)).toBe('basic');
    expect(resolvePlan('')).toBe('basic');
    expect(resolvePlan('PRO')).toBe('basic');
    expect(resolvePlan('enterprise')).toBe('basic');
    expect(resolvePlan('basic')).toBe('basic');
  });

  it('passes through recognized paid plans', () => {
    expect(resolvePlan('pro')).toBe('pro');
    expect(resolvePlan('elite')).toBe('elite');
  });
});

describe('isEntitled — plan vs access level', () => {
  it('opens free sessions to every plan', () => {
    (['basic', 'pro', 'elite'] satisfies Plan[]).forEach((p) => {
      expect(isEntitled(p, 'free')).toBe(true);
    });
  });

  it('gates pro sessions away from basic only', () => {
    expect(isEntitled('basic', 'pro')).toBe(false);
    expect(isEntitled('pro', 'pro')).toBe(true);
    expect(isEntitled('elite', 'pro')).toBe(true);
  });

  it('gates elite sessions to elite only', () => {
    expect(isEntitled('basic', 'elite')).toBe(false);
    expect(isEntitled('pro', 'elite')).toBe(false);
    expect(isEntitled('elite', 'elite')).toBe(true);
  });
});

describe('sessionStatus — lifecycle from the window', () => {
  it('reports upcoming before the start', () => {
    expect(sessionStatus(sessionAt(HOUR, 2 * HOUR, 'free'), NOW)).toBe('upcoming');
  });
  it('reports live inside the window', () => {
    expect(sessionStatus(sessionAt(-HOUR, HOUR, 'free'), NOW)).toBe('live');
  });
  it('reports ended after the window', () => {
    expect(sessionStatus(sessionAt(-2 * HOUR, -HOUR, 'free'), NOW)).toBe('ended');
  });
  it('degrades to ended on an invalid timestamp', () => {
    const broken = { ...sessionAt(0, HOUR, 'free'), startsAt: 'not-a-date' };
    expect(sessionStatus(broken, NOW)).toBe('ended');
  });
});

describe('joinDecision — the entitlement gate (security-relevant)', () => {
  it('ALLOWS join when live AND entitled', () => {
    const d = joinDecision(sessionAt(-HOUR, HOUR, 'pro'), 'pro', NOW);
    expect(d).toEqual({ canJoin: true, reason: null });
  });

  it('BLOCKS a Pro-only live stream for a Basic member', () => {
    const d = joinDecision(sessionAt(-HOUR, HOUR, 'pro'), 'basic', NOW);
    expect(d.canJoin).toBe(false);
    expect(d.reason).toBe('plan-locked');
  });

  it('BLOCKS join before a session is live, even when entitled', () => {
    const d = joinDecision(sessionAt(HOUR, 2 * HOUR, 'free'), 'elite', NOW);
    expect(d.canJoin).toBe(false);
    expect(d.reason).toBe('not-live');
  });

  it('BLOCKS join after a session has ended', () => {
    const d = joinDecision(sessionAt(-2 * HOUR, -HOUR, 'pro'), 'pro', NOW);
    expect(d.canJoin).toBe(false);
    expect(d.reason).toBe('not-live');
  });

  it('lets a free live session through for any plan', () => {
    (['basic', 'pro', 'elite'] satisfies Plan[]).forEach((p) => {
      expect(joinDecision(sessionAt(-HOUR, HOUR, 'free'), p, NOW).canJoin).toBe(true);
    });
  });
});

describe('resolveTopic + filterByTopic — replay URL filter', () => {
  it('returns null (All) for missing/unknown values', () => {
    expect(resolveTopic(undefined)).toBeNull();
    expect(resolveTopic('')).toBeNull();
    expect(resolveTopic('Bogus')).toBeNull();
  });

  it('resolves each known topic', () => {
    expect(resolveTopic('Technical analysis')).toBe('Technical analysis');
    expect(resolveTopic('Fundamental analysis')).toBe('Fundamental analysis');
    expect(resolveTopic('Mindset')).toBe('Mindset');
  });

  it('returns all replays for null and narrows for a topic', () => {
    expect(filterByTopic(REPLAYS, null)).toHaveLength(REPLAYS.length);
    const tech = filterByTopic(REPLAYS, 'Technical analysis');
    expect(tech.length).toBeGreaterThan(0);
    expect(tech.every((r) => r.topic === 'Technical analysis')).toBe(true);
  });
});

describe('accessLabel', () => {
  it('maps each access level to a human label', () => {
    expect(accessLabel('free')).toBe('Free');
    expect(accessLabel('pro')).toBe('Pro');
    expect(accessLabel('elite')).toBe('Elite');
  });
});

describe('nextLiveSession — hero selection', () => {
  it('returns null for an empty list', () => {
    expect(nextLiveSession([], NOW)).toBeNull();
  });

  it('prefers a currently-live session', () => {
    const live = sessionAt(-HOUR, HOUR, 'free');
    const soon = { ...sessionAt(HOUR, 2 * HOUR, 'free'), id: 'soon' };
    expect(nextLiveSession([soon, live], NOW)?.id).toBe('test');
  });

  it('falls back to the soonest upcoming when none are live', () => {
    const later = { ...sessionAt(3 * HOUR, 4 * HOUR, 'free'), id: 'later' };
    const sooner = { ...sessionAt(HOUR, 2 * HOUR, 'free'), id: 'sooner' };
    expect(nextLiveSession([later, sooner], NOW)?.id).toBe('sooner');
  });
});

describe('seed dataset integrity', () => {
  it('ships sessions and replays', () => {
    expect(LIVE_SESSIONS.length).toBeGreaterThan(0);
    expect(REPLAYS.length).toBeGreaterThan(0);
  });

  it('includes at least one pro-gated session (gating matrix sanity)', () => {
    expect(LIVE_SESSIONS.some((s) => s.access === 'pro')).toBe(true);
    expect(LIVE_SESSIONS.some((s) => s.access === 'free')).toBe(true);
  });

  it('has unique session and replay ids', () => {
    const sids = LIVE_SESSIONS.map((s) => s.id);
    const rids = REPLAYS.map((r) => r.id);
    expect(new Set(sids).size).toBe(sids.length);
    expect(new Set(rids).size).toBe(rids.length);
  });
});

describe('calendar builders', () => {
  const session = sessionAt(2 * HOUR, 3 * HOUR, 'free');

  it('produces a valid single-event VCALENDAR', () => {
    const ics = buildIcs(session);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/);
    expect(ics).toMatch(/DTEND:\d{8}T\d{6}Z/);
  });

  it('builds a Google Calendar deep-link with the event window', () => {
    const url = buildGoogleCalendarUrl(session);
    expect(url.startsWith('https://calendar.google.com/calendar/render?')).toBe(true);
    expect(url).toContain('action=TEMPLATE');
    expect(url).toMatch(/dates=\d{8}T\d{6}Z%2F\d{8}T\d{6}Z/);
  });
});
