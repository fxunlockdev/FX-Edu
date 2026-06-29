import { COACHING_CALLS, formatCallTime } from './elite-data';

/**
 * Upcoming coaching calls (M21). Each card shows host, topic, date/time/tz and a
 * "Join call" button that is STUBBED — two-way small-group video is not wired.
 *
 * The video integration (LiveKit Cloud or Amazon Chime SDK, PROJECT.md §9
 * module 21 / §13 row 23) is intentionally NOT added here: no SDK or dependency
 * is introduced. The button is disabled and labelled "coming soon".
 *
 * Pure RSC — there is no client interactivity to wire until the SDK lands.
 */
export function CoachingCalls() {
  return (
    <section aria-labelledby="el-coaching-h">
      <h2 id="el-coaching-h" className="el-section-h">
        Upcoming coaching calls
      </h2>
      <p className="el-section-lead muted">
        Small-group sessions to review your process and habits. These are teaching calls — never
        trade signals or recommendations.
      </p>
      <ul className="el-calls">
        {COACHING_CALLS.map((call) => (
          <li className="el-call" key={call.id}>
            <div className="el-call-when" aria-hidden="true">
              <span className="el-call-dot" />
            </div>
            <div className="el-call-body">
              <h3 className="el-call-topic">{call.topic}</h3>
              <p className="el-call-meta muted">
                Hosted by {call.host} · {call.duration} · {call.seats}
              </p>
              <p className="el-call-time">{formatCallTime(call.startsAtIso, call.tzLabel)}</p>
            </div>
            <div className="el-call-action">
              {/* STUBBED: two-way coaching video coming soon.
                  TODO: wire LiveKit Cloud / Amazon Chime SDK for small-group video. */}
              <button
                type="button"
                className="btn btn-lime btn-sm"
                disabled
                aria-disabled="true"
                title="Two-way coaching video coming soon"
              >
                Join call
              </button>
              <span className="el-call-soon">Coming soon</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="el-stub-note muted">
        Two-way small-group coaching video is coming soon. Joining a live call will be available once
        the secure video experience is ready.
      </p>
    </section>
  );
}
