/**
 * Add-to-calendar helpers (M8 / PROJECT.md §8.6 ✨ "add to calendar").
 *
 * STUBBED at the platform layer: server-issued, signed VEVENTs and a real join
 * URL land with the webinars API. Until then we build a client-side `.ics` data
 * URL (downloadable for Apple/Outlook) and a Google Calendar deep-link from the
 * seed times. Both are pure string builders — no I/O, no dependency.
 *
 * // TODO: wire Mux/IVS live + signed playback tokens via the API — the calendar
 * // event should embed the real `GET /webinars/:id/join-token` join URL once it
 * // exists, not the placeholder below.
 */

import type { LiveSession } from './sessions-types';

const PLACEHOLDER_JOIN_URL = '/sessions';

/** Format an ISO instant as a UTC iCalendar timestamp: YYYYMMDDTHHMMSSZ. */
function toICalUtc(isoInstant: string): string {
  const d = new Date(isoInstant);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Format an ISO instant for Google Calendar's `dates` param (same UTC shape). */
function toGoogleUtc(isoInstant: string): string {
  return toICalUtc(isoInstant);
}

/** Escape iCalendar TEXT values (RFC 5545 §3.3.11). */
function escapeICalText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Build a minimal, valid VCALENDAR string for a single session. The join URL is
 * a placeholder until the signed-token API exists (see file header TODO).
 */
export function buildIcs(session: LiveSession): string {
  const dtStart = toICalUtc(session.startsAt);
  const dtEnd = toICalUtc(session.endsAt);
  const dtStamp = toICalUtc(new Date().toISOString());
  const desc = escapeICalText(
    `${session.summary}\n\nHost: ${session.host}\nJoin: ${PLACEHOLDER_JOIN_URL}`,
  );

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FX Academy//Live Webinars//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${session.id}@fxunlock`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICalText(`FX Academy — ${session.title}`)}`,
    `DESCRIPTION:${desc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Encode the `.ics` text as a downloadable data URL. Used by the client leaf's
 * "Download .ics" link (Apple Calendar / Outlook).
 */
export function buildIcsDataUrl(session: LiveSession): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(session))}`;
}

/**
 * Build a Google Calendar "create event" deep-link for the session. Opens the
 * prefilled event composer in a new tab.
 */
export function buildGoogleCalendarUrl(session: LiveSession): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `FX Academy — ${session.title}`,
    dates: `${toGoogleUtc(session.startsAt)}/${toGoogleUtc(session.endsAt)}`,
    details: `${session.summary}\n\nHost: ${session.host}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
