import { Badge, Button } from '@fxunlock/ui';
import { Countdown } from './Countdown';
import { NEXT_SESSION } from './webinar-data';

interface WebinarsHeroProps {
  /** Pro/replay CTA href, with any `?ref=` already appended. */
  proHref: string;
}

/**
 * Dark webinars hero — headline + CTAs on the left, the "next live" glass card
 * with a live countdown (isolated client leaf) on the right.
 */
export function WebinarsHero({ proHref }: WebinarsHeroProps) {
  return (
    <section className="wbn-hero" aria-labelledby="webinars-heading">
      <div className="glow glow-lime" style={{ width: 460, height: 360, top: -120, right: -80, opacity: 0.3 }} />

      <div className="wrap">
        <div className="wbn-hero-grid">
          <div className="wbn-hero-copy">
            <Badge tone="lime-dark" dot="live">
              Live every week
            </Badge>

            <h1 id="webinars-heading" className="h-lg" style={{ margin: '16px 0 12px' }}>
              Weekly live webinars with experienced educators.
            </h1>

            <p className="body-lg" style={{ color: 'var(--d-ink-var)', maxWidth: 480 }}>
              Technical analysis, fundamental analysis, and mindset sessions — every session
              recorded and saved to your replay library with transcripts and AI summaries.
            </p>

            <div className="row gap2" style={{ marginTop: 24, flexWrap: 'wrap' }}>
              <Button href="#register" variant="lime" size="lg">
                Join a free webinar
              </Button>
              <Button href={proHref} variant="glass" size="lg">
                Get Pro for replays
              </Button>
            </div>
          </div>

          <div className="wbn-next-card">
            <div className="glow glow-lime" style={{ width: 220, height: 220, top: -110, right: -70, opacity: 0.2 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="between" style={{ marginBottom: 12 }}>
                <Badge tone="neg" dot="live" style={{ background: 'rgba(255,90,90,.15)', color: '#ff897d', borderColor: 'rgba(255,90,90,.3)' }}>
                  Next live
                </Badge>
                <span style={{ fontSize: 13, color: 'var(--d-ink-var)', fontWeight: 600 }}>
                  {NEXT_SESSION.when}
                </span>
              </div>

              <h3 className="h-sm" style={{ color: 'var(--d-ink)' }}>
                {NEXT_SESSION.title}
              </h3>
              <p style={{ color: 'var(--d-ink-var)', fontSize: 14, margin: '8px 0 0' }}>
                {NEXT_SESSION.summary}
              </p>

              <Countdown target={NEXT_SESSION.startsAt} label={`Time until ${NEXT_SESSION.title} begins`} />

              <div className="row gap2" style={{ marginBottom: 16 }}>
                <span className="wbn-host" aria-hidden="true">
                  {NEXT_SESSION.hostInitials}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--d-ink)' }}>
                    {NEXT_SESSION.host}
                  </div>
                  <div style={{ color: 'var(--d-ink-var)', fontSize: '12.5px' }}>
                    {NEXT_SESSION.hostRole}
                  </div>
                </div>
              </div>

              <Button href="#register" variant="lime" block>
                Reserve your seat — free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
