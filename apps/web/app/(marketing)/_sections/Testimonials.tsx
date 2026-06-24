import { Container, Disclaimer } from '@fxunlock/ui';

const TESTIMONIALS = [
  [
    'The journal finally made my mistakes obvious. I stopped overtrading on Fridays within a month.',
    'Jordan M.',
    'Pro member · 4 months',
  ],
  [
    'Webinars plus the AI tutor is a cheat code for understanding market structure. No hype, just structure.',
    'Priya S.',
    'Pro member · 7 months',
  ],
  [
    'I came in chasing signals. I left with a process, rules, and a risk calculator I actually use.',
    'Daniel R.',
    'Basic → Pro · 1 year',
  ],
] as const;

/**
 * Community testimonials — three cards. Carries the mandatory disclaimer:
 * member experiences only, no implied or guaranteed profit (PROJECT.md §6.7).
 */
export function Testimonials() {
  return (
    <section className="section" aria-labelledby="testimonials-heading">
      <Container>
        <div className="eyebrow">From the community</div>
        <h2 id="testimonials-heading" className="h-lg" style={{ margin: '12px 0 32px' }}>
          Built for traders who want a process.
        </h2>

        <div className="testi-grid">
          {TESTIMONIALS.map(([quote, name, role]) => (
            <figure key={name} className="tcard" style={{ margin: 0 }}>
              <div className="stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <blockquote style={{ margin: '14px 0 18px', fontSize: 15 }}>“{quote}”</blockquote>
              <figcaption className="row gap2">
                <span className="avatar" style={{ width: 36, height: 36, borderRadius: 9999, background: 'linear-gradient(150deg,#0f3218,#436648)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14 }}>
                  {name[0]}
                </span>
                <span>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{name}</span>
                  <span className="muted" style={{ fontSize: '12.5px' }}>
                    {role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <Disclaimer kind="testimonial" style={{ marginTop: 20, textAlign: 'center' }} />
      </Container>
    </section>
  );
}
