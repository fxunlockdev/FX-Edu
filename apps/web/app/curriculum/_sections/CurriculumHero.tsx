import { Button, Container } from '@fxunlock/ui';
import { CURRICULUM_TIERS } from './curriculum-data';
import { withRef } from './href';

interface CurriculumHeroProps {
  /** Sanitized referral code (or null) used to preserve `?ref=` on CTAs. */
  refCode: string | null;
}

const TOTAL_TIERS = CURRICULUM_TIERS.length;
const TOTAL_MODULES = CURRICULUM_TIERS.reduce((sum, t) => sum + t.moduleCount, 0);
const TOTAL_LESSONS = CURRICULUM_TIERS.reduce((sum, t) => sum + t.lessonCount, 0);

/**
 * Dark gradient hero for the Curriculum page. Holds the page's single `<h1>`,
 * the learning-path framing, headline stats, and the join CTA (ref-preserving).
 */
export function CurriculumHero({ refCode }: CurriculumHeroProps) {
  return (
    <section className="cur-hero" aria-labelledby="cur-hero-heading">
      <div
        className="glow glow-lime glow-pulse"
        style={{ width: 480, height: 380, top: -140, right: -100, opacity: 0.3 }}
        aria-hidden="true"
      />

      <Container style={{ position: 'relative', zIndex: 1 }}>
        <span className="eyebrow fade-up" style={{ color: 'var(--lime)' }}>
          The learning path
        </span>

        <h1
          id="cur-hero-heading"
          className="h-lg fade-up"
          style={{ margin: '14px 0 12px', maxWidth: 680 }}
        >
          A structured forex curriculum, from first principles to advanced execution.
        </h1>

        <p className="body-lg fade-up" style={{ color: 'var(--d-ink-var)', maxWidth: 560 }}>
          Five tiers that build on each other. Every tier ends with a verifiable certificate of
          completion. The full curriculum, including Psychology, is included in Pro.
        </p>

        <dl className="cur-hero-stats fade-up">
          <div className="cur-stat">
            <dt className="l">Tiers</dt>
            <dd className="n" style={{ margin: 0 }}>
              {TOTAL_TIERS}
            </dd>
          </div>
          <div className="cur-stat">
            <dt className="l">Modules</dt>
            <dd className="n" style={{ margin: 0 }}>
              {TOTAL_MODULES}
            </dd>
          </div>
          <div className="cur-stat">
            <dt className="l">Lessons</dt>
            <dd className="n" style={{ margin: 0 }}>
              {TOTAL_LESSONS}+
            </dd>
          </div>
          <div className="cur-stat">
            <dt className="l">Certificates</dt>
            <dd className="n" style={{ margin: 0 }}>
              {TOTAL_TIERS}
            </dd>
          </div>
        </dl>

        <div className="row gap2 fade-up" style={{ marginTop: 26, flexWrap: 'wrap' }}>
          <Button href={withRef('/checkout?plan=pro', refCode)} variant="lime" size="lg">
            Join Pro to unlock all tiers
          </Button>
          <Button href={withRef('/pricing', refCode)} variant="glass" size="lg">
            Compare plans
          </Button>
        </div>
      </Container>
    </section>
  );
}
