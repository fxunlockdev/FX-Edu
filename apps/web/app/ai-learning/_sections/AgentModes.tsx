import { Container } from '@fxunlock/ui';
import { TUTOR_MODES } from './modes';

/**
 * "Four modes, one curriculum" — the course-aware tutor's four educational
 * modes (Explain, Quiz me, What's next, Review a trade) as hover-lift cards.
 * Ported from design/public/ai-learning-landing.html `#agents`.
 */
export function AgentModes() {
  return (
    <section className="section" id="modes" aria-labelledby="modes-heading">
      <Container>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 40px' }}>
          <div className="eyebrow">Four modes, one curriculum</div>
          <h2 id="modes-heading" className="h-lg" style={{ margin: '12px 0 10px' }}>
            AI that adapts to where you are
          </h2>
          <p className="body-lg" style={{ margin: 0 }}>
            One tutor, grounded in the course you are taking. Switch modes whenever you are stuck, curious, or
            ready to be tested.
          </p>
        </div>

        <ul className="ai-mode-grid" role="list">
          {TUTOR_MODES.map((mode) => (
            <li key={mode.id} className="ai-mode-card card-hover">
              <span className="ai-mode-ic" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {mode.icon}
                </svg>
              </span>
              <span className="ai-mode-tag">{mode.label}</span>
              <h3 className="ai-mode-title">{mode.title}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>
                {mode.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
