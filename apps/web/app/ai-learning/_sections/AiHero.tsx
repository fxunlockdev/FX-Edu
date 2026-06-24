import { Badge, Button } from '@fxunlock/ui';
import { withRef } from '@/app/pricing/_sections/href';
import { ChatPreview } from './ChatPreview';

interface AiHeroProps {
  /** Already-sanitized `?ref=` code, forwarded into the join CTAs. */
  refCode: string | null;
}

/**
 * AI-learning hero — dark gradient band with the page's single <h1>, a
 * Pro-only framing chip, two CTAs (the primary join CTA preserves `?ref=`),
 * and a glass chat card that previews the course-aware tutor.
 * Ported from design/public/ai-learning-landing.html `.ah`.
 */
export function AiHero({ refCode }: AiHeroProps) {
  return (
    <section className="hero ai-hero" aria-labelledby="ai-hero-heading">
      <div
        className="glow glow-lime glow-pulse"
        style={{ width: 520, height: 420, top: -160, left: -120, opacity: 0.28 }}
      />

      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="ai-hero-grid">
          <div className="fade-up ai-hero-copy">
            <span
              className="chip"
              style={{ background: 'var(--glass-dark)', color: 'var(--lime)', border: '1px solid var(--d-outline-strong)' }}
            >
              ✦&nbsp;AI learning · Pro plan
            </span>

            <h1 id="ai-hero-heading" className="display" style={{ margin: '18px 0 0' }}>
              A tutor that knows <span style={{ color: 'var(--lime)' }}>your lesson</span>, not just the market.
            </h1>

            <p className="body-lg" style={{ color: 'var(--d-ink-var)', margin: '16px 0 0', maxWidth: 480 }}>
              Course-aware AI that quizzes you, explains concepts simply, points to what to study next, and
              reviews your process. It teaches the method. It never promises profits.
            </p>

            <div className="row gap2" style={{ marginTop: 28, flexWrap: 'wrap' }}>
              <Button href={withRef('/checkout?plan=pro', refCode)} variant="lime" size="lg">
                Try the AI tutor
              </Button>
              <Button href="#modes" variant="glass" size="lg">
                See the four modes
              </Button>
            </div>
          </div>

          <div className="ai-chatcard floaty">
            <div className="ai-chatcard-head">
              <span className="hero-mark" style={{ width: 34, height: 34, borderRadius: 9 }} aria-hidden="true">
                ✦
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--d-ink)' }}>Academy AI Tutor</div>
                <div style={{ fontSize: 12, color: 'var(--d-ink-var)' }}>Tier 2 · Liquidity</div>
              </div>
              <Badge tone="pos" dot style={{ marginLeft: 'auto' }}>
                Online
              </Badge>
            </div>

            <ChatPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
