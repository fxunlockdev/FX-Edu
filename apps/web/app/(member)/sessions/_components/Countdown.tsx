'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
  /** ISO-8601 target instant the countdown ticks toward. */
  readonly targetIso: string;
  /**
   * Label announced when the target is reached (e.g. the session is live).
   * Keeps the live transition accessible without a layout-shifting swap.
   */
  readonly liveLabel?: string;
}

interface Remaining {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly done: boolean;
}

function remainingFrom(targetMs: number, now: number): Remaining {
  const diff = Math.max(0, targetMs - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    done: diff === 0,
  };
}

/** Only the numeric fields are rendered as cells (`done` is announce-only). */
const UNITS: ReadonlyArray<{ key: Exclude<keyof Remaining, 'done'>; label: string }> = [
  { key: 'days', label: 'days' },
  { key: 'hours', label: 'hrs' },
  { key: 'minutes', label: 'min' },
  { key: 'seconds', label: 'sec' },
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Live-session countdown (M8 ✨). Isolated client leaf so the sessions page stays
 * a server component. The target is passed in as an ISO string prop (computed
 * server-side from the seed/DB), so the timer is deterministic.
 *
 * Hydration-safe: state starts as `null` so the SSR pass and the first client
 * render agree (a stable placeholder, no `Date.now()` at render time). The live
 * digits only appear after mount, inside `useEffect`, where the clock is read.
 *
 * Accessibility: a single SR-only `aria-live="polite"` span carries the
 * full-text label and is the only live region — the visible digit cells are
 * `aria-hidden`, so assistive tech hears "Starts in X…" rather than every digit.
 * To avoid per-second chatter, the announced label is coarse (minutes), and only
 * the visible cells refresh each second.
 *
 * Performance: one 1s `setInterval`, cleared on unmount; compositor-friendly
 * (text swap only, no layout-affecting animation).
 */
export function Countdown({ targetIso, liveLabel = 'Session is live now' }: CountdownProps) {
  const targetMs = Date.parse(targetIso);
  const valid = !Number.isNaN(targetMs);

  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    if (!valid) return;
    const tick = () => setRemaining(remainingFrom(targetMs, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetMs, valid]);

  if (!valid) return null;

  // SSR + first client render: stable placeholder so hydration matches.
  const cells = remaining ?? { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };

  const srText =
    remaining === null
      ? 'Countdown loading'
      : remaining.done
        ? liveLabel
        : `Starts in ${cells.days} days, ${cells.hours} hours, ${cells.minutes} minutes`;

  return (
    <div className="sx-count" role="timer">
      {/* The only live region — coarse, polite, won't read every digit. */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {srText}
      </span>
      {UNITS.map((u) => (
        <div className="sx-cu" key={u.key} aria-hidden="true">
          <b>{pad(cells[u.key])}</b>
          <span>{u.label}</span>
        </div>
      ))}
    </div>
  );
}
