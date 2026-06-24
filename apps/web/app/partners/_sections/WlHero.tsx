import { Badge, Button, Container } from '@fxunlock/ui';

/**
 * White-label hero — dark gradient band carrying the single page <h1>, the
 * partner pitch, primary CTAs, and a branded-academy browser preview.
 * Ported from design/public/whitelabel-landing.html `.wl-hero`.
 */
export function WlHero() {
  return (
    <section className="wl-hero" aria-labelledby="wl-hero-heading">
      <div
        className="glow glow-leaf"
        style={{ width: 480, height: 380, top: -140, right: -80, opacity: 0.4 }}
      />

      <Container>
        <div className="wl-hero-grid fade-up">
          <div style={{ maxWidth: 640 }}>
            <Badge tone="lime-dark">For coaches, prop firms &amp; academies</Badge>

            <h1 id="wl-hero-heading" className="h-lg" style={{ margin: '16px 0 12px' }}>
              Launch your own branded{' '}
              <span style={{ color: 'var(--lime)' }}>trading academy</span>.
            </h1>

            <p className="body-lg" style={{ color: 'var(--d-ink-var)', maxWidth: 540 }}>
              White-label FX Academy under your brand, colors and domain. We provide the
              education platform, curriculum engine and trading tools — you own the
              relationship with your members.
            </p>

            <div className="row gap2" style={{ marginTop: 24, flexWrap: 'wrap' }}>
              <Button href="#book-demo" variant="lime" size="lg">
                Book a demo
              </Button>
              <Button href="#features" variant="glass" size="lg">
                See what&apos;s included
              </Button>
            </div>

            <p
              style={{
                fontSize: '12.5px',
                color: 'var(--d-ink-var)',
                marginTop: 22,
                maxWidth: 480,
                lineHeight: 1.6,
              }}
            >
              Educational platform only. We provide tooling and curriculum — not financial
              advice, signals, or any guarantee of trading outcomes for you or your members.
            </p>
          </div>

          <BrandedPreview />
        </div>
      </Container>
    </section>
  );
}

/** Decorative mock of a partner's branded academy at their own domain. */
function BrandedPreview() {
  return (
    <div className="wl-preview" aria-hidden="true">
      <div className="wl-browserbar">
        <span className="wl-browser-dot" style={{ background: '#ff5f57' }} />
        <span className="wl-browser-dot" style={{ background: '#febc2e' }} />
        <span className="wl-browser-dot" style={{ background: '#28c840' }} />
        <span className="wl-browser-url">academy.yourbrand.com</span>
      </div>
      <div className="wl-preview-body">
        <div className="wl-brand-mark">YB</div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--on-surface)',
            }}
          >
            Your Brand Trading Academy
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            Powered by FX Academy · your colors, your domain
          </div>
        </div>
        <Badge tone="forest" style={{ background: '#2a6fdb', color: '#fff' }}>
          Start Learning
        </Badge>
      </div>
    </div>
  );
}
