import { Button, Container, Disclaimer } from '@fxunlock/ui';

/**
 * Closing apply CTA — dark band with the primary application action, the
 * affiliate disclosure, and explicit earnings-are-not-guaranteed language.
 */
export function ApplyCta() {
  return (
    <section className="section dark-sec" id="apply" style={{ textAlign: 'center' }} aria-labelledby="apply-heading">
      <div className="glow glow-lime" style={{ width: 520, height: 320, bottom: -120, left: '50%', transform: 'translateX(-50%)', opacity: 0.32 }} />
      <Container style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
        <h2 id="apply-heading" className="h-lg" style={{ maxWidth: 560, margin: '0 auto' }}>
          Ready to start referring?
        </h2>
        <p className="body-lg" style={{ color: 'var(--d-ink-var)', maxWidth: 480, margin: '14px auto 22px' }}>
          Apply now, get your unique link, build campaigns, and track everything from one dashboard.
        </p>

        <div className="row gap2" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button href="/signup?role=affiliate" variant="lime" size="lg">
            Apply to the program
          </Button>
          <Button href="/login" variant="glass" size="lg">
            Affiliate login
          </Button>
        </div>

        <Disclaimer
          kind="custom"
          variant="callout"
          style={{ marginTop: 28, textAlign: 'left' }}
        >
          <strong style={{ color: 'var(--d-ink)' }}>Affiliate disclosure.</strong> As an FX Academy
          affiliate you earn a commission when someone subscribes through your link. You must clearly
          disclose this relationship wherever you promote, in line with FTC guidance and applicable
          local rules. FX Academy provides educational content only and never gives financial advice.
          Affiliate earnings depend on the referrals you convert and retain and are{' '}
          <strong style={{ color: 'var(--d-ink)' }}>not guaranteed</strong>; the figures on this page
          are illustrative examples, not a promise of income.
        </Disclaimer>
      </Container>
    </section>
  );
}
