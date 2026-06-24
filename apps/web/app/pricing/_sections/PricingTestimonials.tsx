import { Container, Disclaimer } from '@fxunlock/ui';

const TESTIMONIALS = [
  [
    'Upgrading to Pro paid for itself in clarity. The webinars and journal review finally gave my week some structure.',
    'Marcus L.',
    'Pro member · 6 months',
  ],
  [
    'I started on Basic to learn the fundamentals, then moved to Pro for the curriculum. Nothing felt locked behind hype.',
    'Aisha K.',
    'Basic → Pro · 8 months',
  ],
  [
    'Transparent pricing was a big deal for me. No surprise upsells, and I could downgrade without losing my notes.',
    'Tom B.',
    'Pro member · 1 year',
  ],
] as const;

/**
 * Plan-focused testimonials. Carries the mandatory disclaimer: member
 * experiences only, no implied or guaranteed profit (PROJECT.md §6.7).
 */
export function PricingTestimonials() {
  return (
    <section className="section" aria-labelledby="pricing-testimonials-heading">
      <Container>
        <div className="eyebrow">From members</div>
        <h2 id="pricing-testimonials-heading" className="h-lg" style={{ margin: '12px 0 32px' }}>
          Why traders pick a plan and stay.
        </h2>

        <div className="pp-testi">
          {TESTIMONIALS.map(([quote, name, role]) => (
            <figure key={name} className="tcard" style={{ margin: 0 }}>
              <div className="stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <blockquote style={{ margin: '14px 0 18px', fontSize: 15 }}>“{quote}”</blockquote>
              <figcaption className="row gap2">
                <span
                  className="avatar"
                  aria-hidden="true"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: 'linear-gradient(150deg,#0f3218,#436648)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
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
