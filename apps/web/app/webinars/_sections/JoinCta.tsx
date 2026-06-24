import { Button, Container } from '@fxunlock/ui';

interface JoinCtaProps {
  /** Pro CTA href, with any `?ref=` already appended. */
  proHref: string;
}

/** Closing dark CTA band — free registration + Pro, preserving any referral. */
export function JoinCta({ proHref }: JoinCtaProps) {
  return (
    <section className="section dark-sec" style={{ textAlign: 'center' }} aria-labelledby="join-heading">
      <div className="glow glow-lime" style={{ width: 520, height: 320, bottom: -120, left: '50%', transform: 'translateX(-50%)', opacity: 0.32 }} />
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <h2 id="join-heading" className="display" style={{ maxWidth: 680, margin: '0 auto' }}>
          Learn live every week, then revisit anytime.
        </h2>
        <p className="body-lg" style={{ color: 'var(--d-ink-var)', maxWidth: 520, margin: '16px auto 0' }}>
          Join the next free webinar, or go Pro for the full replay library.
        </p>
        <div className="row gap2" style={{ justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <Button href="#register" variant="lime" size="lg">
            Join a free webinar
          </Button>
          <Button href={proHref} variant="glass" size="lg">
            Get Pro for replays
          </Button>
        </div>
      </Container>
    </section>
  );
}
