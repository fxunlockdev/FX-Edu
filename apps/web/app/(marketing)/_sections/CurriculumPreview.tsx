import { Button, Container } from '@fxunlock/ui';

const TIERS = [
  ['Entry', 'What is forex, pairs, how markets move, brokers, risk basics'],
  ['Beginner', 'Candlesticks, support & resistance, chart reading, order types'],
  ['Intermediate', 'Strategy building, confluence, sessions, trade management'],
  ['Advanced', 'Institutional concepts, liquidity, market structure, execution'],
  ['Psychology', 'Discipline, bias, revenge trading, process over outcome'],
] as const;

/** Five-tier curriculum preview strip with a link to the full curriculum. */
export function CurriculumPreview() {
  return (
    <section className="section" aria-labelledby="curriculum-heading">
      <Container>
        <div className="between" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
          <div>
            <div className="eyebrow">Curriculum</div>
            <h2 id="curriculum-heading" className="h-lg" style={{ margin: '10px 0 0' }}>
              From first principles to advanced execution.
            </h2>
          </div>
          <Button href="/curriculum" variant="ghost">
            Explore curriculum →
          </Button>
        </div>

        <div className="tier-strip">
          {TIERS.map(([title, desc], i) => (
            <div key={title} className="tier-c card-hover">
              <div className="ti">Tier {i + 1}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, margin: '6px 0 8px' }}>
                {title}
              </div>
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
