import { Button, Container } from '@fxunlock/ui';

const FORMATS = [
  {
    title: 'Technical analysis',
    desc: 'Market structure, liquidity and session-based setups.',
    icon: <path d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6" />,
  },
  {
    title: 'Fundamental analysis',
    desc: 'Macro drivers, central banks and news interpretation.',
    icon: <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" />,
  },
  {
    title: 'Trading psychology',
    desc: 'Discipline, bias and process over outcome.',
    icon: <path d="M12 3a5 5 0 0 1 5 5c0 2-1 3-2 4v2H9v-2c-1-1-2-2-2-4a5 5 0 0 1 5-5ZM9 19h6M10 22h4" />,
  },
] as const;

const AGENDA = [
  ['Mapping', 'session highs & lows live'],
  ['Liquidity sweeps', 'and entry refinement'],
  ['Live Q&A', 'and trade-idea review'],
] as const;

function AgendaCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.4" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Weekly live webinars — three formats + the next-live session card + CTA. */
export function WebinarSection() {
  return (
    <section className="section" aria-labelledby="webinar-heading">
      <Container>
        <div className="wb-grid">
          <div>
            <div className="eyebrow">Weekly live webinars</div>
            <h2 id="webinar-heading" className="h-lg" style={{ margin: '12px 0 14px' }}>
              Learn live, then revisit anytime.
            </h2>
            <p className="body-lg" style={{ marginBottom: 24 }}>
              Live technical, fundamental, and mindset sessions every week, hosted by experienced
              educators. Every session is recorded and saved to your replay library with transcripts
              and AI summaries.
            </p>
            <div className="stack gap2">
              {FORMATS.map((f) => (
                <div key={f.title} className="wb-row">
                  <span className="wb-ic">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {f.icon}
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{f.title}</div>
                    <p className="muted" style={{ fontSize: '13.5px', margin: '3px 0 0' }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="wb-live-card">
            <div className="glow glow-lime" style={{ width: 240, height: 240, top: -120, right: -80, opacity: 0.22 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="between" style={{ marginBottom: 16 }}>
                <span className="chip" style={{ background: 'var(--glass-dark)', color: 'var(--lime)', border: '1px solid var(--d-outline-strong)' }}>
                  <span className="dot-live" />
                  &nbsp;Next live session
                </span>
                <span style={{ fontSize: 13, color: 'var(--d-ink-var)', fontWeight: 600 }}>Thu · 18:00 GMT</span>
              </div>
              <h3 className="h-sm" style={{ color: 'var(--d-ink)' }}>
                London Session Structure &amp; Liquidity
              </h3>
              <div className="row gap2" style={{ margin: '16px 0 4px' }}>
                <span style={{ width: 40, height: 40, borderRadius: 9999, background: 'linear-gradient(150deg,#0f3218,#436648)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14, flex: 'none' }}>
                  MV
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--d-ink)' }}>Marcus Vale</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--d-ink-var)' }}>Lead educator · 60 min · Technical</div>
                </div>
              </div>
              <ul className="wb-agenda">
                {AGENDA.map(([bold, rest]) => (
                  <li key={bold}>
                    <AgendaCheck />
                    <b>{bold}</b>&nbsp;{rest}
                  </li>
                ))}
              </ul>
              <div className="between" style={{ marginTop: 22, gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--d-ink-var)' }}>312 traders registered</span>
                <Button href="/webinars" variant="lime">
                  Reserve your seat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
