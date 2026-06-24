interface AreaChartProps {
  data: ReadonlyArray<number>;
  height?: number;
  /** Render against a dark surface (changes the last-dot stroke). */
  dark?: boolean;
  color?: string;
  className?: string;
}

/**
 * Static smoothed area/line chart — a server-renderable port of
 * `FX.areaChart` from design/assets/lumina.js (smooth bezier + lime gradient
 * fill). Pure SVG, no client JS, so it streams with the page.
 */
export function AreaChart({
  data,
  height = 90,
  dark = false,
  color = '#a8d642',
  className,
}: AreaChartProps) {
  const W = 520;
  const H = height;
  const P = 6;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const sx = (W - P * 2) / (data.length - 1);
  const sy = (H - P * 2) / rng;
  const pts = data.map((d, i) => [P + i * sx, H - P - (d - min) * sy] as const);

  const first = pts[0]!;
  let path = `M${first[0]},${first[1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!;
    const [x1, y1] = pts[i]!;
    const cx = (x0 + x1) / 2;
    path += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }

  const last = pts[pts.length - 1]!;
  const gradientId = 'fx-area-grad';
  const areaPath = `${path} L${last[0]},${H - P} L${first[0]},${H - P} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label="Net R performance trend, illustrative"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={dark ? 0.55 : 0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={3.5} fill={color} stroke={dark ? '#0a1410' : '#fff'} strokeWidth={2} />
    </svg>
  );
}
