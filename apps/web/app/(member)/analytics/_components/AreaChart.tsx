import type { SeriesPoint } from './analytics';

interface AreaChartProps {
  readonly data: ReadonlyArray<SeriesPoint>;
  /** Accessible description of what the line represents. */
  readonly label: string;
  readonly height?: number;
  /** Stroke/area accent. Defaults to the Lumina lime. */
  readonly color?: string;
}

const WIDTH = 480;
const PAD = 8;

/**
 * Compositor-friendly inline SVG line+area chart (no chart library). Pure and
 * server-renderable — it takes a numeric series and draws a cumulative curve.
 * Animation, if any, is left to CSS so this stays a server component.
 *
 * The data here is the user's own cumulative R history; the chart is purely
 * descriptive and carries no projection or recommendation.
 */
export function AreaChart({ data, label, height = 200, color = '#a8d642' }: AreaChartProps) {
  if (data.length < 2) {
    return <ChartEmpty height={height} message="Not enough closed trades yet to plot a curve." />;
  }

  const values = data.map((p) => p.value);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;

  const innerW = WIDTH - PAD * 2;
  const innerH = height - PAD * 2;

  const x = (i: number) => PAD + (i / (data.length - 1)) * innerW;
  const y = (v: number) => PAD + innerH - ((v - min) / span) * innerH;

  const linePoints = data.map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const baselineY = y(Math.max(min, 0)).toFixed(1);
  const areaPath = `M ${x(0).toFixed(1)},${baselineY} L ${data
    .map((p, i) => `${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(' L ')} L ${x(data.length - 1).toFixed(1)},${baselineY} Z`;

  const last = data[data.length - 1];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={`${label}. Ends at ${last?.value} R after ${data.length} trades.`}
      preserveAspectRatio="none"
    >
      {/* zero baseline */}
      <line
        x1={PAD}
        x2={WIDTH - PAD}
        y1={y(0)}
        y2={y(0)}
        stroke="var(--outline-var)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <path d={areaPath} fill={color} fillOpacity={0.14} />
      <polyline points={linePoints} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(data.length - 1)} cy={y(last?.value ?? 0)} r={3.5} fill={color} />
    </svg>
  );
}

export function ChartEmpty({ height, message }: { height: number; message: string }) {
  return (
    <div
      className="ana-chart-empty"
      style={{ height }}
      role="img"
      aria-label={message}
    >
      <span>{message}</span>
    </div>
  );
}
