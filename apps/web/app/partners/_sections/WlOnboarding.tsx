import { Container, SurfaceCard } from '@fxunlock/ui';

const STEPS = [
  ['1', 'Org details', 'Tell us about your brand, audience and goals so we can scope the launch.'],
  ['2', 'Branding & domain', 'Apply your logo, colors and favicon, then connect your custom domain.'],
  ['3', 'Curriculum & team', 'Configure courses and tiers, then invite your team and instructors.'],
  ['4', 'Launch checklist', 'Run the guided pre-launch checks, then open enrollment to your members.'],
] as const;

/**
 * "Launch in days" — a guided four-step onboarding flow. Ported from
 * design/public/whitelabel-landing.html flow section.
 */
export function WlOnboarding() {
  return (
    <section className="section" aria-labelledby="wl-onboarding-heading">
      <Container>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow">Launch in days</div>
          <h2 id="wl-onboarding-heading" className="h-md" style={{ margin: '8px 0 0' }}>
            A guided onboarding flow
          </h2>
        </div>

        <ol
          className="wl-flow"
          style={{ listStyle: 'none', padding: 0 }}
          aria-label="Onboarding steps"
        >
          {STEPS.map(([n, title, desc]) => (
            <li key={n}>
              <SurfaceCard style={{ textAlign: 'center', height: '100%' }}>
                <div className="wl-flow-n" aria-hidden="true">
                  {n}
                </div>
                <h3 className="h-sm" style={{ fontSize: 15, margin: '0 0 6px' }}>
                  <span className="sr-only">{`Step ${n}: `}</span>
                  {title}
                </h3>
                <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                  {desc}
                </p>
              </SurfaceCard>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
