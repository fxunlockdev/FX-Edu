import { Button } from '@fxunlock/ui';
import { ProductMockup } from './ProductMockup';
import { TrustBadges } from './TrustBadges';

/**
 * Hero — dark gradient section with the headline, primary CTAs, trust badges,
 * an inline educational disclaimer, and the floating product mockup.
 * Ported from design/public/home.html hero block.
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="glow glow-lime glow-pulse" style={{ width: 560, height: 560, top: -200, right: -160 }} />
      <div className="glow glow-leaf" style={{ width: 420, height: 420, bottom: -200, left: -120, opacity: 0.35 }} />

      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero-grid">
          <div className="fade-up hero-copy">
            <span className="chip" style={{ background: 'var(--glass-dark)', color: 'var(--lime)', border: '1px solid var(--d-outline-strong)' }}>
              <span className="dot" />
              &nbsp;Education-first · Risk-aware
            </span>

            <h1 id="hero-heading" className="display" style={{ margin: '22px 0 0' }}>
              Master forex with <span style={{ color: 'var(--lime)' }}>structured education</span>, live guidance &amp; AI support.
            </h1>

            <p className="body-lg" style={{ color: 'var(--d-ink-var)', margin: '20px 0 0', maxWidth: 540 }}>
              FX Academy helps aspiring and active traders build discipline, understand market
              structure, manage risk, and track performance, through one all-in-one learning platform.
            </p>

            <div className="row gap2" style={{ marginTop: 28, flexWrap: 'wrap' }}>
              <Button href="/checkout?plan=pro" variant="lime" size="lg">
                Start Learning
              </Button>
              <Button href="/pricing" variant="glass" size="lg">
                View Pricing
              </Button>
              <Button href="#demo" variant="glass" size="lg" style={{ background: 'transparent' }}>
                ▶&nbsp;&nbsp;Watch Demo
              </Button>
            </div>

            <TrustBadges />

            <p style={{ fontSize: '12.5px', color: 'var(--d-ink-var)', marginTop: 22, maxWidth: 480, lineHeight: 1.6 }}>
              Educational platform only. Forex trading involves risk and is not suitable for every investor.
            </p>
          </div>

          <ProductMockup />
        </div>
      </div>
    </section>
  );
}
