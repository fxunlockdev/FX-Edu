import { Container } from '@fxunlock/ui';
import { SESSION_FORMATS } from './webinar-data';

/** Three session formats — Technical, Fundamental, Mindset. */
export function SessionTypes() {
  return (
    <section className="section" style={{ background: 'var(--c-low)' }} aria-labelledby="types-heading">
      <Container style={{ textAlign: 'center' }}>
        <div className="eyebrow">Session types</div>
        <h2 id="types-heading" className="h-md" style={{ margin: '8px 0 28px' }}>
          Three formats, one disciplined process
        </h2>

        <div className="wbn-types">
          {SESSION_FORMATS.map((f) => (
            <div key={f.title} className="card card-pad card-hover">
              <h3 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>{f.title}</h3>
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
