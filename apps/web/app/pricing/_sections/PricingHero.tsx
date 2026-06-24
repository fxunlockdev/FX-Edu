import { Badge, Container } from '@fxunlock/ui';
import { PlanCards } from './PlanCards';

interface PricingHeroProps {
  refCode: string | null;
}

/**
 * Dark pricing hero. Holds the page's single `<h1>` and the interactive plan
 * grid. The cards overlap up into the dark band (Lumina layered composition).
 */
export function PricingHero({ refCode }: PricingHeroProps) {
  return (
    <section className="pp-hero" aria-labelledby="pricing-heading">
      <div
        className="glow glow-lime"
        style={{ width: 520, height: 380, top: -120, left: '50%', transform: 'translateX(-50%)', opacity: 0.32 }}
        aria-hidden="true"
      />
      <Container style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <Badge tone="lime-dark">Transparent pricing · Cancel anytime</Badge>
        <h1 id="pricing-heading" className="h-lg" style={{ margin: '18px 0 10px' }}>
          Choose the plan that matches your stage.
        </h1>
        <p
          className="body-lg"
          style={{ color: 'var(--d-ink-var)', maxWidth: 520, margin: '0 auto' }}
        >
          Start with the fundamentals or unlock the full system. Upgrade or downgrade anytime, and
          your progress is always preserved.
        </p>
      </Container>

      <Container style={{ position: 'relative', zIndex: 2 }}>
        <PlanCards refCode={refCode} />
      </Container>
    </section>
  );
}
