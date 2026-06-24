import { Container, Disclaimer } from '@fxunlock/ui';
import { CURRICULUM_TIERS } from './curriculum-data';
import { TierCard } from './TierCard';

interface TierPathProps {
  /** Sanitized referral code for ref-preserving CTAs. */
  refCode: string | null;
}

/**
 * The five-tier curriculum path. Renders the connected rail of tier cards and
 * the educational disclaimer beneath it.
 */
export function TierPath({ refCode }: TierPathProps) {
  return (
    <section className="section" style={{ paddingTop: 0 }} aria-labelledby="path-heading">
      <Container style={{ maxWidth: 920 }}>
        <h2 id="path-heading" className="h-md" style={{ marginBottom: 6 }}>
          The five tiers
        </h2>
        <p className="muted" style={{ margin: '0 0 32px', maxWidth: 560 }}>
          Each tier builds on the one before it. Entry and Beginner are included in Basic;
          Intermediate, Advanced, and Psychology unlock with Pro.
        </p>

        <div className="path">
          {CURRICULUM_TIERS.map((tier, i) => (
            <TierCard
              key={tier.title}
              tier={tier}
              index={i + 1}
              isLast={i === CURRICULUM_TIERS.length - 1}
              refCode={refCode}
            />
          ))}
        </div>

        <Disclaimer kind="risk" style={{ marginTop: 28 }} />
      </Container>
    </section>
  );
}
