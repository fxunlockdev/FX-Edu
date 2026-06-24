import { Badge, Button, Container } from '@fxunlock/ui';

/** Pricing teaser — Basic vs Pro cards + a link to the full pricing page. */
export function PricingTeaser() {
  return (
    <section className="section" style={{ background: 'var(--c-low)' }} aria-labelledby="pricing-heading">
      <Container style={{ textAlign: 'center' }}>
        <div className="eyebrow">Pricing</div>
        <h2 id="pricing-heading" className="h-lg" style={{ margin: '12px 0 8px' }}>
          Start where you are. Grow into Pro.
        </h2>
        <p className="body-lg" style={{ maxWidth: 520, margin: '0 auto' }}>
          Transparent pricing. Cancel anytime. Secure payments via Stripe.
        </p>

        <div className="price-teaser-grid">
          <div className="price-card">
            <div className="eyebrow">Basic</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, margin: '8px 0' }}>
              $49
              <span style={{ fontSize: 16, color: 'var(--on-surface-var)', fontWeight: 500 }}>/mo</span>
            </div>
            <p className="muted" style={{ fontSize: 14 }}>
              Entry + Beginner courses, journal, risk calculator, video library.
            </p>
            <Button href="/checkout?plan=basic" variant="ghost" block style={{ marginTop: 18 }}>
              Start Basic
            </Button>
          </div>

          <div className="price-card pop">
            <div className="between">
              <div className="eyebrow" style={{ color: 'var(--primary)' }}>
                Pro
              </div>
              <Badge tone="lime">★ Most Popular</Badge>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, margin: '8px 0' }}>
              $97
              <span style={{ fontSize: 16, color: 'var(--on-surface-var)', fontWeight: 500 }}>/mo</span>
            </div>
            <p className="muted" style={{ fontSize: 14 }}>
              Full curriculum, psychology, weekly webinars, AI agents, analytics &amp; community.
            </p>
            <Button href="/checkout?plan=pro" variant="lime" block style={{ marginTop: 18 }}>
              Start Pro
            </Button>
          </div>
        </div>

        <a href="/pricing" style={{ display: 'inline-block', marginTop: 24, fontWeight: 600, color: 'var(--primary)' }}>
          Compare all plans, incl. Elite →
        </a>
      </Container>
    </section>
  );
}
