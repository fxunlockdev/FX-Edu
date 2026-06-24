import { Container } from '@fxunlock/ui';
import { LEARNING_LOOP } from './curriculum-data';

/**
 * The repeating learn loop (Learn → Practice → Quiz → Reflect) that frames how
 * every module is structured. Educational framing only — no outcome promises.
 */
export function LearningLoop() {
  return (
    <section className="section" aria-labelledby="loop-heading">
      <Container>
        <div className="eyebrow">How each module works</div>
        <h2 id="loop-heading" className="h-md" style={{ margin: '10px 0 0', maxWidth: 620 }}>
          One loop, repeated until it becomes a habit.
        </h2>
        <p className="body-lg" style={{ margin: '12px 0 0', maxWidth: 560 }}>
          Every module follows the same rhythm so progress compounds instead of scattering across
          disconnected tips.
        </p>

        <ol className="loop-grid" style={{ listStyle: 'none', padding: 0 }}>
          {LEARNING_LOOP.map((step, i) => (
            <li key={step.title} className="loop-card">
              <div className="loop-n" aria-hidden="true">
                {i + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
