'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
  /** ISO 8601 target instant for the next live session. */
  target: string;
  /** Accessible label describing what the timer counts down to. */
  label?: string;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

const CELLS = [
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Mins'],
  ['seconds', 'Secs'],
] as const;

function computeRemaining(targetMs: number, nowMs: number): Remaining {
  const diff = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: diff <= 0,
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Live countdown to the next session. Isolated `'use client'` leaf so the
 * surrounding hero stays a server component.
 *
 * Renders deterministically on the server (remaining computed once from
 * `target` against the request time) and re-syncs every second on the client,
 * avoiding a hydration mismatch on the initial paint.
 */
export function Countdown({ target, label = 'Time until the next live session' }: CountdownProps) {
  const targetMs = new Date(target).getTime();
  const valid = Number.isFinite(targetMs);

  const [remaining, setRemaining] = useState<Remaining>(() =>
    computeRemaining(valid ? targetMs : 0, Date.now()),
  );

  useEffect(() => {
    if (!valid) return;
    // Resync immediately on mount, then tick once per second.
    setRemaining(computeRemaining(targetMs, Date.now()));
    const id = window.setInterval(() => {
      setRemaining(computeRemaining(targetMs, Date.now()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [targetMs, valid]);

  if (!valid) return null;

  const value: Record<(typeof CELLS)[number][0], number> = {
    days: remaining.days,
    hours: remaining.hours,
    minutes: remaining.minutes,
    seconds: remaining.seconds,
  };

  const ariaText = remaining.done
    ? 'The session is starting now.'
    : `${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes remaining.`;

  return (
    <div
      className="wbn-countdown"
      role="timer"
      aria-label={label}
      aria-live="off"
    >
      {CELLS.map(([key, text]) => (
        <div key={key} className="wbn-count-cell">
          <span className="wbn-count-num" aria-hidden="true">
            {pad(value[key])}
          </span>
          <span className="wbn-count-label">{text}</span>
        </div>
      ))}
      <span className="wbn-sr-only">{ariaText}</span>
    </div>
  );
}
