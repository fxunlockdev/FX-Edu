import { Container, SurfaceCard } from '@fxunlock/ui';
import { Icon } from './Icon';

const AUDIENCES = [
  [
    'M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z',
    'Prop firms',
    'Give funded and evaluation traders a structured education layer — risk discipline, drawdown awareness and curriculum that complements your challenge, under your brand.',
  ],
  [
    'M22 10 12 5 2 10l10 5 10-5z M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5',
    'Educators & coaches',
    'Turn a course or mentorship into a full academy: lessons, live webinars, journaling and a course-aware AI tutor — without building software yourself.',
  ],
  [
    'M3 3v18h18 M7 14l4-4 3 3 5-6',
    'Brokers as education',
    'Add a credible, education-first learning hub for your clients. Improve retention and engagement with structured content instead of signals or hype.',
  ],
] as const;

/**
 * "Who it's for" — the three core partner profiles. Light surface, three
 * editorial cards. New section beyond the static mock, per the brief.
 */
export function WlAudience() {
  return (
    <section
      className="section"
      style={{ background: 'var(--c-low)' }}
      aria-labelledby="wl-audience-heading"
    >
      <Container>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow">Built for partners</div>
          <h2 id="wl-audience-heading" className="h-md" style={{ margin: '8px 0 0' }}>
            Who launches on FX Academy
          </h2>
        </div>

        <div className="wl-feat3">
          {AUDIENCES.map(([path, title, desc]) => (
            <SurfaceCard key={title} hover>
              <div className="wl-feat-ic">
                <Icon path={path} />
              </div>
              <h3 className="h-sm" style={{ fontSize: 18, margin: '0 0 8px' }}>
                {title}
              </h3>
              <p className="muted" style={{ fontSize: 14.5, margin: 0, lineHeight: 1.6 }}>
                {desc}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
