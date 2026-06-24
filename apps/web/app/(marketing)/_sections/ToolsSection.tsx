import { Container } from '@fxunlock/ui';
import { AiSection } from './AiSection';

const TOOLS = [
  ['M5 4h14v16H5z M9 8h6 M9 12h6', 'Trade Journal', 'Log setups, emotions and outcomes. Patterns become visible.'],
  ['M6 3h12v18H6z M9 7h6 M8 11h.01', 'Risk Calculator', 'Precise position sizing with R:R, pip value and prop-firm modes.'],
  ['M4 20V10 M10 20V4 M16 20v-8 M22 20H2', 'Performance Analytics', 'Win rate by pair, session, setup and behavior.'],
  ['M3 3v18h18 M7 14l4-4 3 3 5-6', 'Strategy Library', 'Curated strategies with rules, invalidations and examples.'],
  ['M12 2 4 6v6c0 5 3.5 8 8 10', 'Prop Firm Prep', 'Rules-aware risk, drawdown monitors and mock evaluations.'],
  ['M5 4h14v12H4z M4 17l8 4 8-4', 'Certificates', 'Verifiable completion at every tier of the curriculum.'],
] as const;

/**
 * Dark "Integrated tools" section — six tool cards plus the nested AI-learning
 * panel (rendered by <AiSection />). Ported from design/public/home.html.
 */
export function ToolsSection() {
  return (
    <section className="section dark-sec" aria-labelledby="tools-heading">
      <div className="glow glow-lime" style={{ width: 480, height: 480, top: -160, left: '50%', transform: 'translateX(-50%)', opacity: 0.3 }} />
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <div className="eyebrow" style={{ color: 'var(--lime)' }}>
          Integrated tools
        </div>
        <h2 id="tools-heading" className="h-lg" style={{ margin: '12px 0 8px' }}>
          Everything a trader needs, in one place.
        </h2>
        <p className="body-lg" style={{ color: 'var(--d-ink-var)', maxWidth: 560 }}>
          Stop stitching tools together. Plan, log, review, and improve without leaving the platform.
        </p>

        <div className="tools-grid">
          {TOOLS.map(([path, title, desc]) => (
            <div key={title} className="tool-card">
              <div className="tool-ic">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={path} />
                </svg>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--d-ink)', marginBottom: 6 }}>{title}</div>
              <p className="muted" style={{ color: 'var(--d-ink-var)', fontSize: 14, margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        <AiSection />
      </Container>
    </section>
  );
}
