'use client';

import { useMemo, useState } from 'react';
import type { LiveSession } from './sessions-types';
import { buildGoogleCalendarUrl, buildIcsDataUrl } from './calendar';

interface SessionActionsProps {
  readonly session: LiveSession;
  /** Whether the viewer already holds a reservation (from the server). */
  readonly reserved: boolean;
}

/**
 * Reserve-seat + add-to-calendar controls for the hero session (M8 ✨). Isolated
 * client leaf — the hero shell and the join gate stay server-rendered.
 *
 * Reserve is OPTIMISTIC + STUBBED: there is no `POST /webinars/:id/register`
 * route wired yet, so we flip local UI state and surface the reminder copy. The
 * real registration mutation (and its confirmation email) lands with the API.
 * // TODO: wire POST /webinars/:id/register via the API.
 *
 * Add-to-calendar is fully client-computed from the seed times: a downloadable
 * `.ics` (Apple/Outlook) and a Google Calendar deep-link. The join URL embedded
 * in the event is a placeholder until signed tokens exist (see calendar.ts).
 */
export function SessionActions({ session, reserved }: SessionActionsProps) {
  const [isReserved, setIsReserved] = useState(reserved);
  const [calOpen, setCalOpen] = useState(false);

  // Computed once per session — the `.ics` embeds a DTSTAMP, so without memo a
  // fresh data URL would be minted on every render.
  const icsUrl = useMemo(() => buildIcsDataUrl(session), [session]);
  const googleUrl = useMemo(() => buildGoogleCalendarUrl(session), [session]);
  const fileName = `${session.id}.ics`;

  return (
    <div className="sx-actions">
      <button
        type="button"
        className="btn btn-lime btn-block"
        aria-pressed={isReserved}
        onClick={() => setIsReserved(true)}
        disabled={isReserved}
      >
        {isReserved ? 'Seat reserved ✓' : 'Reserve your seat'}
      </button>

      <div className="sx-cal">
        <button
          type="button"
          className="btn btn-glass btn-block"
          aria-expanded={calOpen}
          aria-haspopup="menu"
          onClick={() => setCalOpen((v) => !v)}
        >
          Add to calendar
        </button>

        {calOpen && (
          <div className="sx-cal-menu" role="menu" aria-label="Add to calendar options">
            <a
              role="menuitem"
              className="sx-cal-item"
              href={icsUrl}
              download={fileName}
              onClick={() => setCalOpen(false)}
            >
              Apple / Outlook (.ics)
            </a>
            <a
              role="menuitem"
              className="sx-cal-item"
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setCalOpen(false)}
            >
              Google Calendar
            </a>
          </div>
        )}
      </div>

      {isReserved && (
        <p className="sx-reserved-note" role="status">
          You&apos;re in. We&apos;ll email your reminders before it starts.
        </p>
      )}
    </div>
  );
}
