import { Container } from '@fxunlock/ui';

const STEPS = [
  ['1', 'Learn through tiered courses', 'Entry to Advanced, plus Psychology, each step builds on the last.'],
  ['2', 'Attend weekly live sessions', 'Technical, fundamental and mindset webinars with replays.'],
  ['3', 'Ask AI agents questions', 'Course-aware support that quizzes and explains, scoped to your lesson.'],
  ['4', 'Log every trade', 'A structured journal turns activity into reviewable data.'],
  ['5', 'Review your performance', 'Analytics surface your edges, leaks and behavioral patterns.'],
  ['6', 'Improve through feedback', 'Turn insights into rules, and watch discipline compound.'],
] as const;

/** "How FX Academy works" — the six-step disciplined product loop. */
export function ProductLoop() {
  return (
    <section className="section" style={{ background: 'var(--c-low)' }} aria-labelledby="loop-heading">
      <Container>
        <div className="eyebrow">How FX Academy works</div>
        <h2 id="loop-heading" className="h-lg" style={{ margin: '12px 0 36px' }}>
          A disciplined loop, not a feed of tips.
        </h2>

        <div className="steps-grid">
          {STEPS.map(([n, title, desc]) => (
            <div key={n} className="step">
              <span className="step-n">{n}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
                <p className="muted" style={{ fontSize: 14, margin: '5px 0 0' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
