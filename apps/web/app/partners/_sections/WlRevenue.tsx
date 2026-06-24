import { Container, SurfaceCard } from '@fxunlock/ui';

const MODELS = [
  [
    'Licensing',
    'Platform license',
    'A predictable per-member license that scales with your academy. You set member pricing; we keep the platform, curriculum engine and tools running.',
  ],
  [
    'Revenue share',
    'Share the upside',
    'Prefer to share revenue instead of a flat license? We support a revenue-share model so cost tracks your growth, with transparent monthly reporting.',
  ],
  [
    'Ownership',
    'You own the relationship',
    'Members, branding and the customer relationship stay yours. Export your member data at any time — no lock-in on your audience.',
  ],
] as const;

/**
 * Revenue share / licensing model — three plain-language commercial options
 * on a light surface. Deliberately avoids any profit-guarantee framing.
 */
export function WlRevenue() {
  return (
    <section
      className="section"
      style={{ background: 'var(--c-low)' }}
      aria-labelledby="wl-revenue-heading"
    >
      <Container>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow">Commercials</div>
          <h2 id="wl-revenue-heading" className="h-md" style={{ margin: '8px 0 10px' }}>
            Pricing that scales with your member base
          </h2>
          <p
            className="body-lg"
            style={{ maxWidth: 540, margin: '0 auto', color: 'var(--on-surface-var)' }}
          >
            Choose the commercial model that fits how you run your business. Final terms are
            agreed during onboarding.
          </p>
        </div>

        <div className="wl-model">
          {MODELS.map(([eyebrow, title, desc]) => (
            <SurfaceCard key={title} className="wl-model-card" hover>
              <div className="ti">{eyebrow}</div>
              <h3 className="h-sm" style={{ fontSize: 18, margin: '0 0 8px' }}>
                {title}
              </h3>
              <p className="muted" style={{ fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                {desc}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
