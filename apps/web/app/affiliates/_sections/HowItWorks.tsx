import { Container } from '@fxunlock/ui';

const STEPS = [
  {
    n: '1',
    title: 'Apply & get your link',
    desc: 'Apply in minutes. Once approved, grab a unique referral link plus campaign-specific UTM links from your dashboard.',
  },
  {
    n: '2',
    title: 'Share with your audience',
    desc: 'Use ready-made banners, swipe copy, webinar links, and social graphics, all on-brand and compliance-checked.',
  },
  {
    n: '3',
    title: 'Earn on every subscription',
    desc: 'Track signups, conversions, and recurring commission in real time. Payouts run automatically via Stripe Connect.',
  },
] as const;

/** "How it works" — apply → share → earn, three numbered cards. */
export function HowItWorks() {
  return (
    <section className="section" id="how" aria-labelledby="how-heading">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="eyebrow">How it works</div>
          <h2 id="how-heading" className="h-md" style={{ margin: '8px 0 0' }}>
            Three steps to recurring income
          </h2>
        </div>

        <ol className="af-step3" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {STEPS.map((step) => (
            <li key={step.n} className="card card-pad af-step-card">
              <span className="af-step-n" aria-hidden="true">
                {step.n}
              </span>
              <h3 className="h-sm" style={{ fontSize: 17, margin: '0 0 6px' }}>
                {step.title}
              </h3>
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
