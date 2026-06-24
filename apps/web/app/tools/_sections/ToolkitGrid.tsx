import { Container } from '@fxunlock/ui';

interface Tool {
  readonly title: string;
  readonly desc: string;
  /** SVG inner paths (24×24, 1.9 stroke). */
  readonly icon: string;
}

/**
 * The seven showcased tools. The six from the design reference plus the
 * Prop Firm Risk mode (PROJECT.md scope). Each links to the gated full tool.
 */
const TOOLS: ReadonlyArray<Tool> = [
  {
    title: 'Position Size Calculator',
    desc: 'Size every trade to a fixed risk percentage so one loss never breaks your account.',
    icon: 'M3 3v18h18M8 14l3-4 3 2 4-6',
  },
  {
    title: 'Risk / Reward Planner',
    desc: 'Map entry, stop and target to see your R multiple before you commit.',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  },
  {
    title: 'Pip Value Calculator',
    desc: 'Know exactly what each pip is worth across pairs and lot sizes.',
    icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
  {
    title: 'P&L Simulator',
    desc: 'Model outcomes across win rates and R multiples to test your edge.',
    icon: 'M4 19V5M4 19h16M8 15l3-4 3 2 4-6',
  },
  {
    title: 'Correlation Checker',
    desc: 'Avoid stacking correlated pairs and doubling your real exposure.',
    icon: 'M8 8m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0 M16 16m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0',
  },
  {
    title: 'Session Clock',
    desc: 'Track London, New York and Asia opens in your local time.',
    icon: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M12 7v5l3 2',
  },
  {
    title: 'Prop Firm Risk Mode',
    desc: 'Stay inside daily and max drawdown limits with rules-aware sizing for evaluations.',
    icon: 'M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4ZM9 12l2 2 4-4',
  },
];

/** Light "toolkit" section — the seven tools as hover-lift cards. */
export function ToolkitGrid() {
  return (
    <section className="section" id="toolkit" aria-labelledby="toolkit-heading">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="eyebrow">The toolkit</div>
          <h2 id="toolkit-heading" className="h-md" style={{ margin: '8px 0 0' }}>
            Everything you need to plan a disciplined trade
          </h2>
        </div>

        <div className="tt-grid">
          {TOOLS.map((tool) => (
            <article key={tool.title} className="tt-card">
              <div className="tt-ic">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={tool.icon} />
                </svg>
              </div>
              <h3 style={{ fontSize: 16.5, fontWeight: 700, margin: '0 0 8px' }}>
                {tool.title}
              </h3>
              <p
                className="muted"
                style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 14px' }}
              >
                {tool.desc}
              </p>
              <a href="/checkout?plan=pro" className="tt-card-link">
                Open tool <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
