import { Button } from '@fxunlock/ui';
import { AreaChart } from '../../(marketing)/_sections/AreaChart';

/**
 * Affiliate hero — dark forest band with the single page <h1>, the program
 * pitch, primary CTAs, and a glass "projected payout" card.
 * Ported + enriched from design/public/affiliate-landing.html.
 */
export function AffiliateHero() {
  return (
    <section className="af-hero" aria-labelledby="affiliate-heading">
      <div className="glow glow-lime" style={{ width: 460, height: 360, bottom: -140, left: -60, opacity: 0.3 }} />

      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="af-hero-grid">
          <div className="fade-up">
            <span
              className="chip"
              style={{ background: 'var(--glass-dark)', color: 'var(--lime)', border: '1px solid var(--d-outline-strong)' }}
            >
              <span className="dot" />
              &nbsp;Affiliate program
            </span>

            <h1 id="affiliate-heading" className="h-lg" style={{ margin: '16px 0 12px' }}>
              Earn recurring commission for every{' '}
              <span style={{ color: 'var(--lime)' }}>trader you refer</span>.
            </h1>

            <p className="body-lg" style={{ color: 'var(--d-ink-var)', maxWidth: 500 }}>
              Promote an education-first platform you can stand behind. Transparent attribution,
              real-time tracking, a 60-day cookie window, and Stripe Connect payouts, no inventory,
              no support load.
            </p>

            <div className="row gap2" style={{ marginTop: 24, flexWrap: 'wrap' }}>
              <Button href="#apply" variant="lime" size="lg">
                Apply to the program
              </Button>
              <Button href="#how" variant="glass" size="lg">
                How it works
              </Button>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--d-ink-var)', marginTop: 22, maxWidth: 460, lineHeight: 1.6 }}>
              Commissions are illustrative and depend on referrals you actually convert. Earnings are
              not guaranteed.
            </p>
          </div>

          <div className="glass af-payout-card">
            <div className="between" style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: 'var(--d-ink-var)' }}>Projected monthly payout</span>
              <span className="chip chip-lime-d">Pro · 30%</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 42, color: 'var(--lime)', letterSpacing: '-0.02em' }}>
              $2,910
            </div>
            <p style={{ color: 'var(--d-ink-var)', fontSize: 13, margin: '4px 0 16px' }}>
              100 active Pro referrals × $29.10/mo, example only.
            </p>
            <AreaChart
              data={[3, 4, 3.6, 5, 6, 5.4, 7, 8.2, 7.6, 9, 10.4, 11, 12.6, 14]}
              height={80}
              dark
              color="var(--lime)"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
