import { Button, Container } from '@fxunlock/ui';
import { withRef } from './href';

interface JoinCtaProps {
  /** Sanitized referral code for ref-preserving CTAs. */
  refCode: string | null;
}

/** Closing join CTA — both buttons preserve a valid `?ref=` into checkout/pricing. */
export function JoinCta({ refCode }: JoinCtaProps) {
  return (
    <section className="section" aria-labelledby="join-heading">
      <Container style={{ textAlign: 'center' }}>
        <h2 id="join-heading" className="h-lg" style={{ maxWidth: 680, margin: '0 auto' }}>
          Start at the right tier and build from there.
        </h2>
        <p className="body-lg" style={{ maxWidth: 520, margin: '14px auto 0' }}>
          Join Pro to unlock the full path, including Intermediate, Advanced, and Psychology.
        </p>
        <div className="row gap2" style={{ justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
          <Button href={withRef('/checkout?plan=pro', refCode)} variant="lime" size="lg">
            Join Pro
          </Button>
          <Button href={withRef('/checkout?plan=basic', refCode)} variant="ghost" size="lg">
            Start with Basic
          </Button>
        </div>
      </Container>
    </section>
  );
}
