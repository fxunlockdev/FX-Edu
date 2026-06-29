'use client';

/**
 * STUBBED video surface for the Lesson Player (M3 / PROJECT.md §8.4). The real
 * adaptive-HLS player is a Mux integration with signed playback per §6.4 — that is
 * NOT wired here. This renders a designed 16:9 placeholder plus a fully
 * presentational control bar (play/pause/seek/speed/captions/fullscreen) so the
 * screen reads as the finished player without pretending to stream.
 *
 * No Mux SDK, no real media element. The seek bar shows the resume position the
 * server handed us; controls are inert affordances (they toast/no-op) until the
 * player module is integrated.
 *
 * @param resumeSeconds furthest watched position from `lesson_progress` (resume).
 * @param durationSeconds total lesson runtime (for the time read-out).
 */
interface PlayerStageProps {
  readonly resumeSeconds: number;
  readonly durationSeconds: number;
  readonly onCaptions: () => void;
  readonly onSpeed: (value: string) => void;
}

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const SPEED_OPTIONS = ['0.75x', '1x', '1.25x', '1.5x', '2x'] as const;

export function PlayerStage({
  resumeSeconds,
  durationSeconds,
  onCaptions,
  onSpeed,
}: PlayerStageProps) {
  const progressPct =
    durationSeconds > 0 ? Math.min(100, (resumeSeconds / durationSeconds) * 100) : 0;

  return (
    <div className="lp-player">
      <div
        className="lp-stage"
        role="img"
        aria-label="Lesson video — streaming coming soon, Mux integration pending"
      >
        <div className="lp-stage-badge">
          <span className="lp-stage-dot" aria-hidden="true" />
          Preview
        </div>
        <div className="lp-stage-center">
          <span className="lp-play" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <p className="lp-stage-title">Video streaming coming soon</p>
          <p className="lp-stage-sub">Mux integration pending</p>
        </div>
      </div>

      <div className="lp-ctrlbar" aria-label="Player controls (preview)">
        <button type="button" className="lp-ctrl" aria-label="Play (preview)" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <span className="lp-time" aria-label="Resume position">
          {formatClock(resumeSeconds)} / {formatClock(durationSeconds)}
        </span>

        <div
          className="lp-seek"
          role="slider"
          aria-label="Seek (preview)"
          aria-valuemin={0}
          aria-valuemax={Math.round(durationSeconds)}
          aria-valuenow={Math.round(resumeSeconds)}
          aria-disabled="true"
        >
          <i style={{ width: `${progressPct}%` }} />
        </div>

        <select
          className="lp-speed"
          aria-label="Playback speed (preview)"
          defaultValue="1x"
          onChange={(e) => onSpeed(e.target.value)}
        >
          {SPEED_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button type="button" className="lp-ctrl" aria-label="Captions (preview)" onClick={onCaptions}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="M7 11h3M14 11h3M7 14h6" />
          </svg>
        </button>

        <button type="button" className="lp-ctrl" aria-label="Fullscreen (preview)" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
