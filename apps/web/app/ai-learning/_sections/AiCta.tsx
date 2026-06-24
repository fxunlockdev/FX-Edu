import { Badge, Button, Container } from '@fxunlock/ui';
import { withRef } from '@/app/pricing/_sections/href';

interface AiCtaProps {
  /** Already-sanitized `?ref=` code, forwarded into the join CTA. */
  refCode: string | null;
}

/**
 * Closing CTA band — Pro-only framing for the AI tutor with a join CTA that
 * preserves `?ref=` attribution into checkout, plus a secondary link to the
 * full pricing comparison.
 */
export function AiCta({ refCode }: AiCtaProps) {
  return (
    <section className="section dark-sec ai-cta" style={{ textAlign: 'center' }} aria-labelledby="ai-cta-heading">
      <div
        className="glow glow-lime"
        style={{ width: 520, height: 320, bottom: -120, left: '50%', transform: 'translateX(-50%)', opacity: 0.32 }}
      />
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <Badge tone="lime-dark">Included with Pro</Badge>
        <h2 id="ai-cta-heading" className="display" style={{ maxWidth: 660, margin: '16px auto 0' }}>
          Learn with a tutor that has read your whole course.
        </h2>
        <p className="body-lg" style={{ color: 'var(--d-ink-var)', maxWidth: 520, margin: '14px auto 0' }}>
          The AI tutor and all four modes are part of every Pro membership, alongside the full curriculum,
          weekly webinars, and the trading toolkit.
        </p>

        <div className="row gap2" style={{ justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <Button href={withRef('/checkout?plan=pro', refCode)} variant="lime" size="lg">
            Join Pro
          </Button>
          <Button href="/pricing" variant="glass" size="lg">
            Compare plans
          </Button>
        </div>
      </Container>
    </section>
  );
}
