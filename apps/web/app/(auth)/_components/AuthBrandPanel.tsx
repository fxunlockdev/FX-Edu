import { Logo } from '@fxunlock/ui';

interface AuthBrandPanelProps {
  /** 'login' shows the quote + stats; 'signup' shows the perks list. */
  variant: 'login' | 'signup';
}

const PERKS: ReadonlyArray<string> = [
  'Structured curriculum, Entry → Advanced',
  'Weekly live webinars + replays',
  'Course-aware AI tutor',
  'Built-in journal, risk calculator & analytics',
];

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * Dark brand panel shown beside the auth forms (hidden on mobile). Ported from
 * the design login/signup split-screen. Server component — no interactivity.
 */
export function AuthBrandPanel({ variant }: AuthBrandPanelProps) {
  return (
    <aside className="auth-brand" aria-hidden="true">
      <div
        className="auth-glow"
        style={
          variant === 'login'
            ? { width: 420, height: 420, top: -160, right: -120 }
            : { width: 420, height: 420, bottom: -160, left: -120 }
        }
      />

      <a href="/" className="auth-brand-content">
        <Logo variant="light" size={28} />
      </a>

      {variant === 'login' ? (
        <div className="auth-brand-content">
          <p className="auth-quote">
            “Master risk before chasing returns. Build consistency through structured learning,
            journaling, and guided feedback.”
          </p>
          <div className="auth-stat-row">
            <div>
              <div className="auth-stat-num">5</div>
              <div className="auth-stat-label">Course tiers</div>
            </div>
            <div>
              <div className="auth-stat-num">Weekly</div>
              <div className="auth-stat-label">Live webinars</div>
            </div>
            <div>
              <div className="auth-stat-num">AI</div>
              <div className="auth-stat-label">Course tutor</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-brand-content">
          <h2 className="h-md" style={{ color: 'var(--d-ink)', marginBottom: 22 }}>
            Everything you need to trade with discipline.
          </h2>
          {PERKS.map((perk) => (
            <div key={perk} className="auth-perk">
              <CheckIcon />
              {perk}
            </div>
          ))}
        </div>
      )}

      <p className="auth-fineprint">Educational platform only. Forex trading involves risk.</p>
    </aside>
  );
}
