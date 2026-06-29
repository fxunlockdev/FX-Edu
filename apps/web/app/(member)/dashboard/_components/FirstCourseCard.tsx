import { Badge } from '@fxunlock/ui';

/**
 * Recommended-first-course card for the new-user dashboard state (M18 / §18).
 * The lesson player (module 3) is not built yet, so the CTA points at the public
 * curriculum overview rather than a non-existent lesson route — honest, never a
 * dead link. No course-completion or certificate promises beyond the offered
 * structure.
 */
export function FirstCourseCard() {
  return (
    <section className="mod col-5" aria-labelledby="dash-course-h">
      <div className="mod-head">
        <h3 id="dash-course-h">Recommended first course</h3>
      </div>
      <div className="dash-course-thumb" aria-hidden="true">
        <Badge tone="lime-dark">Entry · Tier 1</Badge>
      </div>
      <p className="dash-course-title">What is Forex? Markets &amp; mechanics</p>
      <p className="muted dash-course-sub">5 lessons · ~35 min · certificate on completion</p>
      <a href="/curriculum" className="btn btn-lime btn-block dash-card-cta">
        Explore the curriculum
      </a>
    </section>
  );
}
