import { Container } from '@fxunlock/ui';

const PROBLEMS = [
  ['Scattered learning', '5 platforms, 0 structure. Knowledge never compounds.'],
  ['No feedback loop', 'Trades happen, but lessons aren’t captured or reviewed.'],
  ['Risk as an afterthought', 'Position sizing guessed, not calculated.'],
  ['Emotion-driven', 'No journal means bias and revenge trading go unseen.'],
] as const;

/** "The problem" — intro copy + four pain-point cards. */
export function Problem() {
  return (
    <section className="section" aria-labelledby="problem-heading">
      <Container style={{ textAlign: 'center' }}>
        <div className="eyebrow">The problem</div>
        <h2 id="problem-heading" className="h-lg" style={{ maxWidth: 760, margin: '12px auto 0', textWrap: 'balance' }}>
          Most traders jump between YouTube, Discord, spreadsheets, and random strategies.
        </h2>
        <p className="body-lg" style={{ maxWidth: 620, margin: '18px auto 0' }}>
          FX Academy brings learning, practice, journaling, and feedback into one structured system,
          so progress is visible and discipline compounds.
        </p>

        <div className="problem-grid">
          {PROBLEMS.map(([title, desc]) => (
            <div key={title} className="card card-pad card-hover">
              <div className="problem-mark">!</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <p className="muted" style={{ fontSize: 14, margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
