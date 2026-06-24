import { Button, Container } from '@fxunlock/ui';
import { withRef } from './href';

interface CertificateBandProps {
  /** Sanitized referral code for ref-preserving CTAs. */
  refCode: string | null;
}

/**
 * Dark band explaining the certificate model — recognition of *education*, not
 * results (PROJECT.md §8.4 module 9). Carries a ref-preserving pricing CTA.
 */
export function CertificateBand({ refCode }: CertificateBandProps) {
  return (
    <section
      className="section dark-sec"
      style={{ textAlign: 'center' }}
      aria-labelledby="cert-heading"
    >
      <div
        className="glow glow-lime"
        style={{
          width: 520,
          height: 320,
          bottom: -120,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0.28,
        }}
        aria-hidden="true"
      />
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <div className="eyebrow" style={{ color: 'var(--lime)' }}>
          Certificates
        </div>
        <h2 id="cert-heading" className="h-md" style={{ margin: '12px auto 0', maxWidth: 600 }}>
          Finish a tier? Earn a verifiable certificate.
        </h2>
        <p
          className="body-lg"
          style={{ color: 'var(--d-ink-var)', maxWidth: 540, margin: '14px auto 24px' }}
        >
          Each completed tier issues a shareable certificate with a public verification ID.
          Certificates recognize the education you completed — never a trading outcome.
        </p>
        <Button href={withRef('/pricing', refCode)} variant="lime" size="lg">
          View pricing
        </Button>
      </Container>
    </section>
  );
}
