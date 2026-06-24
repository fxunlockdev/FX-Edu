import { Badge } from '@fxunlock/ui';
import { AreaChart } from './AreaChart';

const NET_R_SERIES = [
  2, 3, 2.4, 4, 3.6, 5.2, 4.8, 6.4, 7, 6.6, 8.2, 9, 8.4, 10.2, 11, 12.4, 11.6, 13.8, 15, 14.2, 16.4, 18.4,
];

const MINI_METRIC_VALUE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: 20,
};
const MINI_METRIC_LABEL: React.CSSProperties = { fontSize: 11, color: 'var(--d-ink-var)' };

/**
 * Floating dashboard product mockup shown in the hero — browser chrome,
 * win-rate/R:R/streak metrics, a 30-day Net R chart, and an AI tutor prompt.
 * Ported from design/public/home.html `.mock`.
 */
export function ProductMockup() {
  return (
    <div className="mock-wrap fade-up">
      <div className="mock" aria-hidden="true">
        <div className="mock-top">
          <span className="mock-dot" style={{ background: '#ff5f57' }} />
          <span className="mock-dot" style={{ background: '#febc2e' }} />
          <span className="mock-dot" style={{ background: '#28c840' }} />
          <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--d-ink-var)', fontWeight: 600 }}>
            FX Academy · Dashboard
          </span>
        </div>

        <div style={{ padding: 18 }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--d-ink-var)' }}>Good morning, Alex</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--d-ink)' }}>
                Continue: Market Structure
              </div>
            </div>
            <Badge tone="lime-dark">Pro</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div className="mini-metric">
              <div style={MINI_METRIC_LABEL}>Win rate</div>
              <div style={{ ...MINI_METRIC_VALUE, color: 'var(--lime)' }}>58%</div>
            </div>
            <div className="mini-metric">
              <div style={MINI_METRIC_LABEL}>Avg R:R</div>
              <div style={{ ...MINI_METRIC_VALUE, color: 'var(--d-ink)' }}>1.9</div>
            </div>
            <div className="mini-metric">
              <div style={MINI_METRIC_LABEL}>Streak</div>
              <div style={{ ...MINI_METRIC_VALUE, color: 'var(--d-ink)' }}>12d</div>
            </div>
          </div>

          <div className="mini-metric" style={{ marginBottom: 14 }}>
            <div className="between" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--d-ink-var)' }}>Net R · last 30 days</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--lime)' }}>+18.4R</span>
            </div>
            <div style={{ height: 90 }}>
              <AreaChart data={NET_R_SERIES} height={90} dark />
            </div>
          </div>

          <div className="mini-metric" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="hero-mark">✦</span>
            <div style={{ fontSize: 12, color: 'var(--d-ink-var)' }}>
              AI Tutor: <span style={{ color: 'var(--d-ink)' }}>“Want a 3-question quiz on liquidity?”</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
