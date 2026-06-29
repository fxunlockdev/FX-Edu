/**
 * Tiny dependency-free SVG sparkline (server component). Renders an area + line
 * for a small series — used for the referred-MRR trend on the overview page.
 * Pure SVG: no client JS, compositor-friendly (no layout animation).
 */
interface SparklineProps {
  data: ReadonlyArray<number>;
  width?: number;
  height?: number;
  /** Accessible description of what the trend shows. */
  label: string;
}

export function Sparkline({ data, width = 640, height = 96, label }: SparklineProps) {
  if (data.length < 2) {
    return (
      <div className="ana-chart-empty" style={{ height }}>
        Not enough data yet
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = 6;
  const usableH = height - pad * 2;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + usableH - ((v - min) / span) * usableH;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <svg
      className="aff-spark"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={label}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="affSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(168,214,66,0.34)" />
          <stop offset="100%" stopColor="rgba(168,214,66,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#affSparkFill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--lime-dim)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
