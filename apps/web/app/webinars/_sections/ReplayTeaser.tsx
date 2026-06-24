import { Badge, Button } from '@fxunlock/ui';
import { REPLAY_HIGHLIGHTS } from './webinar-data';

interface ReplayTeaserProps {
  /** Pro CTA href, with any `?ref=` already appended. */
  proHref: string;
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Replay-library teaser — a Pro benefit, presented as a dark band. */
export function ReplayTeaser({ proHref }: ReplayTeaserProps) {
  return (
    <section className="section wbn-replay" aria-labelledby="replay-heading">
      <div className="glow glow-leaf" style={{ width: 420, height: 320, bottom: -160, left: -120, opacity: 0.3 }} />

      <div className="wrap">
        <div className="wbn-replay-grid">
          <div>
            <Badge tone="lime-dark">Pro</Badge>
            <h2 id="replay-heading" className="h-md" style={{ color: 'var(--d-ink)', margin: '14px 0 12px' }}>
              Missed a session? Watch the replay anytime.
            </h2>
            <p className="body-lg" style={{ color: 'var(--d-ink-var)', maxWidth: 460 }}>
              Pro members get the full replay library — every recorded session with searchable
              transcripts and AI-generated summaries, so the learning never expires.
            </p>
            <div className="row gap2" style={{ marginTop: 24, flexWrap: 'wrap' }}>
              <Button href={proHref} variant="lime" size="lg">
                Unlock the replay library
              </Button>
            </div>
          </div>

          <ul className="wbn-replay-list">
            {REPLAY_HIGHLIGHTS.map((item) => (
              <li key={item} className="wbn-replay-row">
                <span className="wbn-replay-ic">
                  <Check />
                </span>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--d-ink)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
