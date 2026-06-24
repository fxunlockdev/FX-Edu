import { Container, SurfaceCard } from '@fxunlock/ui';
import { Icon } from './Icon';

const FEATURES = [
  [
    'M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z',
    'Your branding',
    'Logo, primary and accent colors, favicon, plus a dark or light preference — applied across the whole academy.',
  ],
  [
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18',
    'Custom domain',
    'Run on your own domain with guided DNS setup, automatic SSL and verification.',
  ],
  [
    'M4 5h16v12H4z M4 17l8 4 8-4',
    'Curriculum config',
    'Use our structured course library or publish your own branded courses, lessons and tiers.',
  ],
  [
    'M3 3h8v8H3z M13 3h8v5h-8z',
    'Member & partner dashboard',
    'Manage members, track engagement and retention, and review licensing in one place.',
  ],
] as const;

/**
 * "Everything included" — the four pillars of the white-label offering on a
 * light surface. Ported from design/public/whitelabel-landing.html `#features`.
 */
export function WlFeatures() {
  return (
    <section className="section" id="features" aria-labelledby="wl-features-heading">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="eyebrow">Everything included</div>
          <h2 id="wl-features-heading" className="h-md" style={{ margin: '8px 0 0' }}>
            Your brand on a proven education platform
          </h2>
        </div>

        <div className="wl-feat4" style={{ marginTop: 32 }}>
          {FEATURES.map(([path, title, desc]) => (
            <SurfaceCard key={title} hover>
              <div className="wl-feat-ic">
                <Icon path={path} />
              </div>
              <h3 className="h-sm" style={{ fontSize: 17, margin: '0 0 6px' }}>
                {title}
              </h3>
              <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>
                {desc}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
