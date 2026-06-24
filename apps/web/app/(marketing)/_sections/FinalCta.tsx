import { Button, Container } from '@fxunlock/ui';

/** Closing dark CTA band. */
export function FinalCta() {
  return (
    <section className="section dark-sec" style={{ textAlign: 'center' }} aria-labelledby="final-cta-heading">
      <div className="glow glow-lime" style={{ width: 520, height: 320, bottom: -120, left: '50%', transform: 'translateX(-50%)', opacity: 0.32 }} />
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <h2 id="final-cta-heading" className="display" style={{ maxWidth: 680, margin: '0 auto' }}>
          Build your trading foundation the right way.
        </h2>
        <div className="row gap2" style={{ justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <Button href="/checkout?plan=pro" variant="lime" size="lg">
            Join Pro
          </Button>
          <Button href="/curriculum" variant="glass" size="lg">
            See the curriculum
          </Button>
        </div>
      </Container>
    </section>
  );
}
