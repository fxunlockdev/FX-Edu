import { Container, Disclaimer } from '@fxunlock/ui';

const TIERS = [
  {
    eyebrow: 'Basic referral',
    value: '20%',
    desc: 'Recurring on every $49/mo Basic subscription, for the lifetime of the referral.',
    highlight: false,
  },
  {
    eyebrow: 'Pro referral',
    value: '30%',
    desc: 'Recurring on every $97/mo Pro subscription, your highest-converting, highest-paying tier.',
    highlight: true,
  },
  {
    eyebrow: 'Cookie window',
    value: '60d',
    desc: 'Last-touch attribution with a 60-day cookie and transparent, real-time reporting.',
    highlight: false,
  },
] as const;

/** Commission tiers — Basic 20%, Pro 30%, 60-day cookie, in a bordered triptych. */
export function CommissionTiers() {
  return (
    <section className="section" style={{ background: 'var(--c-low)' }} aria-labelledby="commission-heading">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="eyebrow">Commission</div>
          <h2 id="commission-heading" className="h-md" style={{ margin: '8px 0 0' }}>
            Transparent, recurring payouts
          </h2>
        </div>

        <dl className="af-comm" style={{ margin: 0 }}>
          {TIERS.map((tier) => (
            <div key={tier.eyebrow} className="af-comm-cell">
              <dt className="eyebrow" style={tier.highlight ? { color: 'var(--primary)' } : undefined}>
                {tier.eyebrow}
              </dt>
              <dd
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 32,
                  margin: '8px 0',
                  color: tier.highlight ? 'var(--primary)' : 'var(--on-surface)',
                }}
              >
                {tier.value}
              </dd>
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                {tier.desc}
              </p>
            </div>
          ))}
        </dl>

        <Disclaimer kind="custom" variant="callout" style={{ marginTop: 28, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
          Commission rates apply to net subscription revenue after refunds and chargebacks. Rates and
          terms may change with notice. Affiliate income depends on the referrals you convert and is
          not guaranteed.
        </Disclaimer>
      </Container>
    </section>
  );
}
