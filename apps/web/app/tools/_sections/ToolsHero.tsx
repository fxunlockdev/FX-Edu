import { Badge, Button, Container, Disclaimer } from '@fxunlock/ui';
import { PositionSizeCalculator } from './PositionSizeCalculator';

/**
 * Trading Tools hero — dark gradient band with the single page <h1>, primary
 * CTAs, and the free working Position Size calculator (client leaf) plus its
 * slippage/spread/execution disclaimer. Ported from
 * design/public/trading-tools.html.
 */
export function ToolsHero() {
  return (
    <section className="th" aria-labelledby="tools-heading">
      <div
        className="glow glow-lime glow-pulse"
        style={{ width: 520, height: 420, top: -160, right: -120, opacity: 0.3 }}
      />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        <div className="th-grid">
          <div className="fade-up th-copy">
            <Badge
              tone="lime-dark"
              style={{ background: 'var(--glass-dark)', border: '1px solid var(--d-outline-strong)' }}
            >
              Free trading tools
            </Badge>

            <h1
              id="tools-heading"
              className="display"
              style={{ margin: '18px 0 14px', fontSize: 'clamp(36px, 4.6vw, 56px)' }}
            >
              Trade by the numbers,{' '}
              <span style={{ color: 'var(--lime)' }}>not by emotion.</span>
            </h1>

            <p className="body-lg" style={{ color: 'var(--d-ink-var)', maxWidth: 480 }}>
              A suite of free calculators that put risk first. Size every position, plan every
              stop, and know your exposure before you click buy.
            </p>

            <div className="row gap2" style={{ marginTop: 26, flexWrap: 'wrap' }}>
              <Button href="/checkout?plan=pro" variant="lime" size="lg">
                Start learning free
              </Button>
              <Button href="#toolkit" variant="glass" size="lg">
                Explore the tools
              </Button>
            </div>
          </div>

          <div>
            <PositionSizeCalculator />
            <Disclaimer kind="custom" style={{ marginTop: 14, color: 'var(--d-ink-var)' }}>
              Estimates only. Real fills move with spread, slippage, and execution — your broker&apos;s
              pip value, leverage, and minimum lot step may differ. Educational tool, not financial
              advice.
            </Disclaimer>
          </div>
        </div>
      </Container>
    </section>
  );
}
