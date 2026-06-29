import { Badge } from '@fxunlock/ui';
import { ReplayFilters } from './ReplayFilters';
import type { Replay, SessionTopic } from './sessions-types';

interface ReplayLibraryProps {
  readonly replays: readonly Replay[];
  readonly activeTopic: SessionTopic | null;
  /** When false the whole library is replaced by the Pro upgrade lock. */
  readonly isPro: boolean;
}

const TOPIC_SHORT: Record<SessionTopic, string> = {
  'Technical analysis': 'Technical',
  'Fundamental analysis': 'Fundamental',
  Mindset: 'Mindset',
};

/**
 * Pro replay library (M8 / PROJECT.md §8.6). Server component.
 *
 * Pro-gated: a Basic member never receives replay rows — when `isPro` is false
 * we render the upgrade lock and read nothing. The real entitlement gate is
 * server-side; this is the designed locked surface (§6.1).
 *
 * Each unlocked card shows a 16:9 recording placeholder (Mux STUBBED — no SDK,
 * no signed token), host, duration, topic, an AI study summary and a transcript
 * affordance. // TODO: wire Mux/IVS live + signed playback tokens via the API —
 * the placeholder becomes a `<mux-player>` fed by `GET /replays` + a signed URL.
 */
export function ReplayLibrary({ replays, activeTopic, isPro }: ReplayLibraryProps) {
  if (!isPro) return <ReplayLock />;

  return (
    <>
      <div className="sx-section-head">
        <h2 className="sx-section-title">Replay library</h2>
        <ReplayFilters active={activeTopic} />
      </div>

      {replays.length === 0 ? (
        <p className="muted">No replays in this topic yet.</p>
      ) : (
        <ul className="sx-replays" aria-label="Replay recordings">
          {replays.map((r) => (
            <li key={r.id}>
              <ReplayCard replay={r} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ReplayCard({ replay }: { replay: Replay }) {
  return (
    <article className="sx-rep">
      {/* 16:9 player placeholder — Mux STUBBED. */}
      <div className="sx-thumb" role="img" aria-label={`Recording: ${replay.title}`}>
        <span className="sx-topic-chip">
          <Badge tone="lime-dark">{TOPIC_SHORT[replay.topic]}</Badge>
        </span>
        <span className="sx-play" aria-hidden="true">
          <PlayIcon />
        </span>
        <span className="sx-stub-note">Replay streaming coming soon</span>
      </div>

      <div className="sx-rbody">
        <h3 className="sx-rtitle">{replay.title}</h3>
        <p className="sx-rmeta muted">
          {replay.host} · {replay.durationMin} min
        </p>
        <p className="sx-rsummary">
          <span className="sx-ai-tag">AI summary</span>
          {replay.aiSummary}
        </p>
        <div className="sx-rfoot">
          {replay.hasTranscript ? (
            <span className="sx-rtag">
              <DocIcon /> Transcript
            </span>
          ) : (
            <span className="sx-rtag sx-rtag-pending">Transcript processing</span>
          )}
        </div>
      </div>
    </article>
  );
}

function ReplayLock() {
  return (
    <section className="sx-lock" aria-labelledby="sx-lock-h">
      <div className="sx-lock-hero">
        <span className="sx-lock-glow" aria-hidden="true" />
        <Badge tone="lime-dark">Pro feature</Badge>
        <h2 id="sx-lock-h" className="h-sm">
          Every session, recorded for you
        </h2>
        <p>
          Miss a live webinar? Pro members get the full replay library — recordings with searchable
          transcripts, AI study summaries and a topic filter, on your schedule.
        </p>
      </div>
      <div className="sx-lock-body">
        <ul className="sx-lock-list">
          <li>On-demand replays of every live session</li>
          <li>Transcript + AI summary for fast review</li>
          <li>Filter by Technical, Fundamental or Mindset</li>
        </ul>
        <a href="/pricing" className="btn btn-lime btn-block btn-lg">
          Upgrade to Pro
        </a>
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="M14 3v5h5" />
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}
