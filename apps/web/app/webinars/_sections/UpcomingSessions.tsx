import { Badge, Button, Container } from '@fxunlock/ui';
import { UPCOMING_SESSIONS } from './webinar-data';

interface UpcomingSessionsProps {
  /** Pro CTA href, with any `?ref=` already appended. */
  proHref: string;
}

/** This week's schedule — three session cards (Free / Pro). */
export function UpcomingSessions({ proHref }: UpcomingSessionsProps) {
  return (
    <section className="section" aria-labelledby="upcoming-heading">
      <Container>
        <div className="between" style={{ marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow">This week</div>
            <h2 id="upcoming-heading" className="h-md" style={{ margin: '8px 0 0' }}>
              Upcoming sessions
            </h2>
          </div>
        </div>

        <ul className="wbn-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {UPCOMING_SESSIONS.map((s) => {
            const isFree = s.access === 'Free';
            return (
              <li key={`${s.type}-${s.title}`} className="wbn-card card-hover">
                <div className="wbn-thumb">
                  <Badge tone="lime">{s.type}</Badge>
                </div>
                <div className="wbn-card-body">
                  <div className="between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary-tint)' }}>
                      {s.when}
                    </span>
                    <Badge tone={isFree ? 'pos' : 'outline'}>{s.access}</Badge>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>{s.title}</h3>
                  <p className="muted" style={{ fontSize: 13, margin: '0 0 14px' }}>
                    Hosted by {s.host} · 60 min
                  </p>
                  <Button
                    href={isFree ? '#register' : proHref}
                    variant={isFree ? 'lime' : 'ghost'}
                    size="sm"
                    block
                  >
                    {isFree ? 'Register free' : 'Unlock with Pro'}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
