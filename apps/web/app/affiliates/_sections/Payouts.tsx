import { Container } from '@fxunlock/ui';

const POINTS = [
  {
    title: 'Onboard once with Stripe Connect',
    desc: 'Connect your Stripe account in a guided flow. Stripe handles identity verification, tax forms, and compliance, we never touch your banking details.',
    icon: <path d="M4 7h16v10H4z M4 11h16 M8 15h3" />,
  },
  {
    title: 'Automatic monthly payouts',
    desc: 'Approved commission is paid out automatically each month once you clear the minimum threshold. No invoices to chase.',
    icon: <path d="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  },
  {
    title: 'Global currency support',
    desc: 'Get paid in your local currency wherever Stripe Connect is available, with transparent conversion handled by Stripe.',
    icon: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z M2 12h20 M12 2c3 3 3 17 0 20 M12 2c-3 3-3 17 0 20" />,
  },
] as const;

/** Payouts — how affiliates get paid (Stripe Connect), three feature rows. */
export function Payouts() {
  return (
    <section className="section dark-sec" aria-labelledby="payouts-heading">
      <div className="glow glow-lime" style={{ width: 440, height: 440, top: -160, right: -120, opacity: 0.26 }} />
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <div className="eyebrow" style={{ color: 'var(--lime)' }}>
          Payouts
        </div>
        <h2 id="payouts-heading" className="h-lg" style={{ margin: '12px 0 8px' }}>
          Reliable payouts via Stripe Connect.
        </h2>
        <p className="body-lg" style={{ color: 'var(--d-ink-var)', maxWidth: 560 }}>
          We use Stripe Connect so your earnings are paid securely and on schedule, with full
          visibility from click to cash-out.
        </p>

        <div className="af-payout-grid">
          {POINTS.map((p) => (
            <div key={p.title} className="tool-card">
              <span className="tool-ic">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {p.icon}
                </svg>
              </span>
              <h3 style={{ fontWeight: 700, color: 'var(--d-ink)', fontSize: 16, margin: '0 0 6px' }}>
                {p.title}
              </h3>
              <p className="muted" style={{ color: 'var(--d-ink-var)', fontSize: 14, margin: 0 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
