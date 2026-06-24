import { Container, Disclaimer } from '@fxunlock/ui';

interface Guardrail {
  readonly title: string;
  readonly body: string;
}

const GUARDRAILS: ReadonlyArray<Guardrail> = [
  {
    title: 'No profit promises',
    body: 'The tutor will never guarantee returns, predict the market, or imply that trading is easy money.',
  },
  {
    title: 'No trade signals',
    body: 'It will not tell you what to buy or sell, or give entry, exit, or stop-loss levels. It explains concepts, not calls.',
  },
  {
    title: 'Not financial advice',
    body: 'It teaches process and reasoning. It never gives personalized financial advice or recommendations.',
  },
  {
    title: 'Grounded in the course',
    body: 'Answers are tied to the curriculum you are taking, so the guidance stays consistent, accurate, and in scope.',
  },
];

const ShieldIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--lime-dim)" strokeWidth="2.2" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/**
 * "Guardrails you can trust" — the page's prominent responsibility surface.
 * Renders the four hard limits of the AI tutor plus the canonical AI
 * disclaimer as a bordered callout (Disclaimer kind="ai", variant="callout").
 * Educational only: never buy/sell/entry/exit signals, never profit
 * guarantees (PROJECT.md §5, §6.7, §7.2). Ported from `.guard`.
 */
export function Guardrails() {
  return (
    <section className="section dark-sec" aria-labelledby="guardrails-heading">
      <div
        className="glow glow-leaf"
        style={{ width: 460, height: 360, top: -140, right: -120, opacity: 0.3 }}
      />
      <Container style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 36px' }}>
          <div className="eyebrow" style={{ color: 'var(--lime)' }}>
            Responsible by design
          </div>
          <h2 id="guardrails-heading" className="h-lg" style={{ margin: '12px 0 10px', color: 'var(--d-ink)' }}>
            Guardrails you can trust
          </h2>
          <p className="body-lg" style={{ color: 'var(--d-ink-var)', margin: 0 }}>
            The tutor is built to teach, not to tip. These limits are not optional settings — they are how it
            works.
          </p>
        </div>

        <ul className="ai-guard-grid" role="list">
          {GUARDRAILS.map((rule) => (
            <li key={rule.title} className="ai-guard-row">
              <span className="ai-guard-ic">{ShieldIcon}</span>
              <div>
                <h3 className="ai-guard-title">{rule.title}</h3>
                <p className="muted" style={{ color: 'var(--d-ink-var)', fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>
                  {rule.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Disclaimer kind="ai" variant="callout" className="ai-guard-disclaimer" />
      </Container>
    </section>
  );
}
