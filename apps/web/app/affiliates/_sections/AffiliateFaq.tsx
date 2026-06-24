import { Container } from '@fxunlock/ui';

const FAQS = [
  {
    q: 'Who can join the affiliate program?',
    a: 'Educators, content creators, community owners, and anyone with an audience interested in trading education. We review every application to keep the program quality-first and compliant.',
  },
  {
    q: 'How much can I earn?',
    a: 'You earn 20% recurring on Basic ($49/mo) and 30% recurring on Pro ($97/mo) referrals, for as long as the member stays subscribed. Actual earnings depend entirely on how many referrals you convert and retain, and are not guaranteed.',
  },
  {
    q: 'How does attribution work?',
    a: 'We use a 60-day, last-touch cookie. If someone clicks your link and subscribes within 60 days, the referral is credited to you, with transparent reporting in your dashboard.',
  },
  {
    q: 'When and how do I get paid?',
    a: 'Approved commission is paid automatically every month via Stripe Connect once you clear the minimum payout threshold. Stripe handles verification, tax forms, and currency conversion.',
  },
  {
    q: 'What about refunds and chargebacks?',
    a: 'Commission is calculated on net revenue. If a referred member refunds or charges back within the refund window, the corresponding commission is reversed.',
  },
  {
    q: 'Do I need to disclose that I am an affiliate?',
    a: 'Yes. You must clearly disclose your affiliate relationship with FX Academy wherever you promote, in line with FTC guidance and local advertising rules. We provide disclosure templates in your dashboard.',
  },
] as const;

/** FAQ — native <details> accordions, no client JS required. */
export function AffiliateFaq() {
  return (
    <section className="section" style={{ background: 'var(--c-low)' }} aria-labelledby="faq-heading">
      <Container style={{ maxWidth: 760 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="eyebrow">FAQ</div>
          <h2 id="faq-heading" className="h-md" style={{ margin: '8px 0 0' }}>
            Questions, answered
          </h2>
        </div>

        <div className="af-faq">
          {FAQS.map((item) => (
            <details key={item.q} className="af-faq-item">
              <summary className="af-faq-q">
                <span>{item.q}</span>
                <svg className="af-faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <p className="muted af-faq-a">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
