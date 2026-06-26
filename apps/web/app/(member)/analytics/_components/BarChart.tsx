import type { SeriesPoint } from './analytics';
import { ChartEmpty } from './AreaChart';

interface BarChartProps {
  readonly data: ReadonlyArray<SeriesPoint>;
  /** Accessible description of the chart. */
  readonly label: string;
  /** Fixed axis maximum (e.g. 100 for win-rate %). Omit to auto-scale. */
  readonly max?: number;
  /** Format a value for the in-bar/label readout. */
  readonly format?: (value: number) => string;
  /** When true, render bars that can go negative around a zero axis (avg R). */
  readonly signed?: boolean;
  readonly height?: number;
}

const POS = '#a8d642';
const NEG = '#ba1a1a';
const NEU = '#6c9e75';

/**
 * Inline SVG horizontal bar chart (no chart library). Pure, server-renderable.
 * Two modes:
 *  - unsigned (win-rate %): bars grow left→right against `max` (default 100).
 *  - signed (avg R): bars diverge from a centre axis; negatives go red.
 *
 * Each row is a labelled <g> with an aria-label so the whole chart is legible to
 * assistive tech without a data table. Purely descriptive of the user's data.
 */
export function BarChart({ data, label, max, format, signed = false, height }: BarChartProps) {
  if (data.length === 0) {
    return <ChartEmpty height={height ?? 170} message="No data for this breakdown yet." />;
  }

  const fmt = format ?? ((v: number) => String(v));

  if (signed) {
    return <SignedBars data={data} label={label} format={fmt} />;
  }

  const ceiling = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="ana-bars" aria-label={label}>
      {data.map((d) => {
        const pct = Math.max(0, Math.min(100, (d.value / ceiling) * 100));
        const color = d.value >= ceiling * 0.6 ? POS : d.value >= ceiling * 0.45 ? NEU : NEG;
        return (
          <li key={d.label} className="ana-bar-row">
            <span className="ana-bar-label">{d.label}</span>
            <span
              className="ana-bar-track"
              role="img"
              aria-label={`${d.label}: ${fmt(d.value)}`}
            >
              <span className="ana-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </span>
            <span className="ana-bar-value">{fmt(d.value)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Avg-R style bars: diverge from a centre baseline, negatives in red. */
function SignedBars({
  data,
  label,
  format,
}: {
  data: ReadonlyArray<SeriesPoint>;
  label: string;
  format: (value: number) => string;
}) {
  const magnitude = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  return (
    <ul className="ana-bars ana-bars-signed" aria-label={label}>
      {data.map((d) => {
        const pct = (Math.abs(d.value) / magnitude) * 50; // half-width per side
        const positive = d.value >= 0;
        return (
          <li key={d.label} className="ana-bar-row">
            <span className="ana-bar-label">{d.label}</span>
            <span
              className="ana-bar-track ana-bar-track-centre"
              role="img"
              aria-label={`${d.label}: ${format(d.value)}`}
            >
              <span
                className="ana-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: positive ? POS : NEG,
                  // Positive bars grow right from centre; negatives grow left.
                  // Both anchor exactly at the 50% axis; the unused side is auto.
                  left: positive ? '50%' : 'auto',
                  right: positive ? 'auto' : '50%',
                }}
              />
            </span>
            <span className={`ana-bar-value ${positive ? 'pos' : 'neg'}`}>{format(d.value)}</span>
          </li>
        );
      })}
    </ul>
  );
}
