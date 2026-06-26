import type { Analytics, AnalyticsSummary } from './analytics';
import { AreaChart } from './AreaChart';
import { BarChart } from './BarChart';
import { formatR } from '../../journal/trade-fields';

interface AnalyticsViewProps {
  readonly data: Analytics;
}

const SUMMARY_CARDS: ReadonlyArray<{ label: string; key: keyof AnalyticsSummary }> = [
  { label: 'Win rate', key: 'winRate' },
  { label: 'Avg R', key: 'avgR' },
  { label: 'Net R', key: 'netR' },
  { label: 'Avg risk', key: 'avgRisk' },
  { label: 'Trades', key: 'tradesAnalyzed' },
  { label: 'Consistency', key: 'consistencyGrade' },
];

/**
 * Presentational analytics dashboard — receives the already-computed view-model
 * and renders the summary grid, the four chart panels and the data-derived
 * insights. Pure: no I/O, no state. Charts are inline SVG/CSS (no library).
 *
 * All copy here is descriptive of the user's own logged history. Nothing
 * projects future returns or recommends a trade (PROJECT.md §9 module 6).
 */
export function AnalyticsView({ data }: AnalyticsViewProps) {
  const { summary, series, insights } = data;

  return (
    <>
      <section className="ana-sum" aria-label="Summary metrics">
        {SUMMARY_CARDS.map((c) => {
          const value = summary[c.key];
          return (
            <div className="ana-sc" key={c.label}>
              <div className="l">{c.label}</div>
              <div className="v">{typeof value === 'string' ? value : '—'}</div>
            </div>
          );
        })}
      </section>

      <div className="ana-grid2">
        <section className="ana-panel" aria-labelledby="ana-equity-h">
          <h2 className="ph" id="ana-equity-h">
            Net R over time
          </h2>
          <p className="sub muted">Cumulative R multiple across your closed trades</p>
          <AreaChart data={series.netROverTime} label="Cumulative net R over time" />
        </section>

        <section className="ana-panel" aria-labelledby="ana-session-h">
          <h2 className="ph" id="ana-session-h">
            Win rate by session
          </h2>
          <p className="sub muted">Which trading window has treated you best</p>
          <BarChart
            data={series.winRateBySession}
            label="Win rate by trading session"
            max={100}
            format={(v) => `${v}%`}
          />
        </section>
      </div>

      <div className="ana-grid2">
        <section className="ana-panel" aria-labelledby="ana-dow-h">
          <h2 className="ph" id="ana-dow-h">
            Win rate by day of week
          </h2>
          <p className="sub muted">Spot the days your edge slips</p>
          <BarChart
            data={series.winRateByDayOfWeek}
            label="Win rate by day of week"
            max={100}
            format={(v) => `${v}%`}
          />
        </section>

        <section className="ana-panel" aria-labelledby="ana-setup-h">
          <h2 className="ph" id="ana-setup-h">
            Avg R by setup
          </h2>
          <p className="sub muted">Average realized R per strategy you tagged</p>
          <BarChart
            data={series.avgRBySetup}
            label="Average R by setup"
            signed
            format={(v) => formatR(v)}
          />
        </section>
      </div>

      <div className="ana-grid2">
        <section className="ana-panel" aria-labelledby="ana-pair-h">
          <h2 className="ph" id="ana-pair-h">
            R multiple by pair
          </h2>
          <p className="sub muted">Average realized R per instrument</p>
          <BarChart
            data={series.avgRByPair}
            label="Average R by pair"
            signed
            format={(v) => formatR(v)}
          />
        </section>

        <section className="ana-panel" aria-labelledby="ana-insights-h">
          <div className="ana-insights-head">
            <span className="ana-insights-badge" aria-hidden="true">
              ◆
            </span>
            <h2 className="ph" id="ana-insights-h" style={{ margin: 0 }}>
              Insights
            </h2>
          </div>
          <div className="ana-insights-grid">
            {insights.map((insight) => (
              <div className="ana-insight" key={insight.id}>
                <span className="dot" aria-hidden="true" />
                <p>{insight.text}</p>
              </div>
            ))}
          </div>
          {/* AI-generated insights arrive with the AI Tutor module. */}
          <p className="ana-insights-note">
            Computed directly from your logged trades — descriptive, not advice. These do not
            recommend any trade.
          </p>
        </section>
      </div>
    </>
  );
}
