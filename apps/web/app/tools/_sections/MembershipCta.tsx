import { Button, Container } from '@fxunlock/ui';

/**
 * Closing CTA — tools are free, but discipline is the membership product.
 * Ported from design/public/trading-tools.html final band.
 */
export function MembershipCta() {
  return (
    <section
      className="section"
      style={{ background: 'var(--c-low)' }}
      aria-labelledby="membership-cta-heading"
    >
      <Container style={{ textAlign: 'center', maxWidth: 640 }}>
        <h2 id="membership-cta-heading" className="h-md" style={{ margin: '0 0 12px' }}>
          Tools are the start. Discipline is the system.
        </h2>
        <p className="body-lg" style={{ margin: '0 0 24px' }}>
          Our calculators are free forever. The curriculum, webinars and AI tutor turn good
          numbers into a repeatable process.
        </p>
        <Button href="/pricing" variant="forest" size="lg">
          See membership plans
        </Button>
      </Container>
    </section>
  );
}
