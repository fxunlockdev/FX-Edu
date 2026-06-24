import { Badge, Disclaimer } from '@fxunlock/ui';

interface PromptChip {
  readonly label: string;
  readonly icon: React.ReactNode;
}

const PROMPTS: ReadonlyArray<PromptChip> = [
  {
    label: 'Explain liquidity',
    icon: (
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    ),
  },
  {
    label: 'Quiz me on order types',
    icon: <path d="M9 11a3 3 0 1 1 4 2.8c-.8.4-1 .8-1 1.7M12 18h.01" />,
  },
  {
    label: 'What should I study next?',
    icon: <path d="M5 12h14M13 6l6 6-6 6" />,
  },
];

/**
 * AI-learning panel (glass) — course-aware tutor with guardrails. Carries an
 * explicit AI disclaimer: never promises profits or gives personalized advice
 * (PROJECT.md §6.5, §7.2). Rendered inside the dark ToolsSection.
 */
export function AiSection() {
  return (
    <div className="glass ai-panel" aria-labelledby="ai-heading">
      <div>
        <Badge tone="lime-dark">AI Learning Agents</Badge>
        <h3 id="ai-heading" className="h-md" style={{ margin: '14px 0 10px', color: 'var(--d-ink)' }}>
          Course-aware AI that quizzes, explains, and guides. It never hypes.
        </h3>
        <p className="muted" style={{ color: 'var(--d-ink-var)' }}>
          Context-aware to your current lesson. It can quiz you, explain concepts simply, and suggest
          your next lesson. It will never promise profits or give personalized financial advice.
        </p>

        <div className="row gap1" style={{ marginTop: 20, flexWrap: 'wrap' }}>
          {PROMPTS.map((p) => (
            <span key={p.label} className="ai-prompt">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {p.icon}
              </svg>
              {p.label}
            </span>
          ))}
        </div>

        <Disclaimer kind="ai" className="disclaimer-note" style={{ marginTop: 18, color: 'var(--d-ink-var)' }} />
      </div>

      <div className="glass-2" style={{ borderRadius: 'var(--r-lg)', padding: 18 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <span className="hero-mark" style={{ width: 28, height: 28, borderRadius: 8 }}>
            ✦
          </span>
          <div className="glass-2" style={{ padding: '10px 13px', borderRadius: 12, fontSize: '13.5px', color: 'var(--d-ink)' }}>
            Liquidity is where orders cluster, often above swing highs or below swing lows. Want an
            example on EUR/USD?
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <div style={{ background: 'var(--lime)', color: 'var(--on-lime)', padding: '10px 13px', borderRadius: 12, fontSize: '13.5px', fontWeight: 600 }}>
            Yes, and quiz me after
          </div>
        </div>
      </div>
    </div>
  );
}
