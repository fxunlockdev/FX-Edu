import { Badge } from '@fxunlock/ui';
import {
  accessLabel,
  isEntitled,
  sessionStatus,
  type LiveSession,
  type Plan,
} from './sessions-types';

interface UpcomingScheduleProps {
  readonly sessions: readonly LiveSession[];
  readonly plan: Plan;
  /** Server clock passed down so status is computed once, consistently. */
  readonly now: number;
}

/** Short weekday + day-of-month for the date rail (UTC-stable display). */
function dateParts(iso: string): { day: string; weekday: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: '--', weekday: '---' };
  const weekday = d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
  const day = String(d.getUTCDate()).padStart(2, '0');
  return { day, weekday: weekday.toUpperCase() };
}

/** "18:00 GMT" style time label from the ISO start + timezone label. */
function timeLabel(iso: string, tz: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm} ${tz}`;
}

const TOPIC_SHORT: Record<LiveSession['topic'], string> = {
  'Technical analysis': 'Technical',
  'Fundamental analysis': 'Fundamental',
  Mindset: 'Mindset',
};

/**
 * Upcoming schedule list (M8 / PROJECT.md §8.6). Server component — each row
 * shows title, host, topic, date/time/timezone, access level and registration
 * state. The trailing control reflects the entitlement-gated lifecycle:
 *
 *  - live + entitled  → "Join live" (the real gate is server-side; this is a hint)
 *  - live + locked    → "Pro to join" (disabled-looking upgrade hint)
 *  - upcoming + reserved → "Reserved"
 *  - upcoming + open  → "Reserve"
 *
 * No client JS — interactivity (reserve/join) is delegated to the hero's leaf
 * and, ultimately, the server-side join-token route.
 */
export function UpcomingSchedule({ sessions, plan, now }: UpcomingScheduleProps) {
  return (
    <ul className="sx-sched" aria-label="Upcoming sessions">
      {sessions.map((s) => {
        const status = sessionStatus(s, now);
        const entitled = isEntitled(plan, s.access);
        const { day, weekday } = dateParts(s.startsAt);

        return (
          <li className="sx-srow" key={s.id}>
            <div className="sx-date" aria-hidden="true">
              <b>{day}</b>
              <span>{weekday}</span>
            </div>

            <div className="sx-sinfo">
              <h3 className="sx-stitle">{s.title}</h3>
              <p className="sx-smeta muted">
                {s.host} · {timeLabel(s.startsAt, s.timezoneLabel)} · {TOPIC_SHORT[s.topic]}
              </p>
              <div className="sx-stags">
                <Badge tone={s.access === 'free' ? 'outline' : 'lime-dark'}>
                  {accessLabel(s.access)}
                </Badge>
                {status === 'live' && <Badge tone="neg" dot="live">Live</Badge>}
              </div>
            </div>

            <div className="sx-saction">
              <ScheduleControl
                status={status}
                entitled={entitled}
                reserved={s.registration === 'reserved'}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ScheduleControl({
  status,
  entitled,
  reserved,
}: {
  status: ReturnType<typeof sessionStatus>;
  entitled: boolean;
  reserved: boolean;
}) {
  if (status === 'ended') {
    return <span className="sx-ctl-muted">Recording soon</span>;
  }
  if (status === 'live') {
    if (entitled) {
      return (
        <a className="btn btn-lime btn-sm" href="#live">
          Join live
        </a>
      );
    }
    return (
      <a className="btn btn-ghost btn-sm" href="/pricing">
        Pro to join
      </a>
    );
  }
  // upcoming
  if (reserved) return <span className="sx-ctl-muted">Reserved ✓</span>;
  return (
    <a className="btn btn-ghost btn-sm" href="#live">
      Reserve
    </a>
  );
}
