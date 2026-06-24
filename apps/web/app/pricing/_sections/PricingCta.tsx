import { Button, Container } from '@fxunlock/ui';
import { withRef } from './href';

interface PricingCtaProps {
  refCode: string | null;
}

/**
 * Closing dark CTA band. The primary action preserves the Pro plan and any
 * referral code; a secondary action points coaches/prop firms to White Label
 * (mirrors design/public/pricing.html).
 */
export function PricingCta({ refCode }: PricingCtaProps) {
  return (
    <section
      className="section dark-sec"
      style={{ textAlign: 'center' }}
      aria-labelledby="pricing-cta-heading"
    >
      <div
        className="glow glow-lime"
        style={{ width: 520, height: 320, bottom: -120, left: '50%', transform: 'translateX(-50%)', opacity: 0.32 }}
        aria-hidden="true"
      />
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <h2 id="pricing-cta-heading" className="display" style={{ maxWidth: 680, margin: '0 auto' }}>
          Ready to learn with a real plan?
        </h2>
        <p
          className="body-lg"
          style={{ color: 'var(--d-ink-var)', maxWidth: 480, margin: '14px auto 0' }}
        >
          Pick a tier and start today, or white-label FX Academy under your own brand and domain.
        </p>
        <div className="row gap2" style={{ justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <Button href={withRef('/checkout?plan=pro', refCode)} variant="lime" size="lg">
            Start Pro
          </Button>
          <Button href="/whitelabel" variant="glass" size="lg">
            Explore White Label
          </Button>
        </div>
      </Container>
    </section>
  );
}
