import { REMINDER_SCHEDULE } from './sessions-types';

/**
 * Reminders explainer (M8 / PROJECT.md §8.6: confirm / 24h / 1h / 30m). Server
 * component — purely informational. The actual reminder fan-out runs through the
 * notifications queue worker (§11) once registration is wired.
 * // TODO: reminders are sent by the queue worker after POST /webinars/:id/register.
 */
export function RemindersNote() {
  return (
    <aside className="sx-reminders" aria-labelledby="sx-rem-h">
      <h2 id="sx-rem-h" className="sx-section-title">
        Reserve once, we’ll remind you
      </h2>
      <ol className="sx-rem-list">
        {REMINDER_SCHEDULE.map((line) => (
          <li key={line} className="sx-rem-item">
            <span className="sx-rem-dot" aria-hidden="true" />
            {line}
          </li>
        ))}
      </ol>
    </aside>
  );
}
