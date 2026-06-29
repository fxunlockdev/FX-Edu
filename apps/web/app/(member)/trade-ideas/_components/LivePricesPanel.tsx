import { Badge } from '@fxunlock/ui';
import { PRICE_BOARD, type Quote } from './market-data';

/**
 * Live prices panel (M11). Server component — STUBBED. The Polygon feed is not
 * wired, so this renders a static educational sample (last value, % change,
 * sparkline) behind a "delayed/educational sample" label, and degrades to an
 * honest "data unavailable" note when offline (§11 "graceful degradation"; §18
 * "price widget degrades gracefully"). Nothing here is live or execution-grade.
 *
 * Sparklines are pure SVG over the pre-normalized sample series — no client JS,
 * no provider SDK.
 */
export function LivePricesPanel() {
  const board = PRICE_BOARD;

  return (
    <section className="ti-side-card ti-prices" aria-labelledby="ti-prices-h">
      <span className="ti-prices-glow" aria-hidden="true" />
      <div className="ti-side-head">
        <h2 id="ti-prices-h" className="ti-side-title ti-on-dark">
          Live prices
        </h2>
        <Badge tone={board.available ? 'pos' : 'outline'} dot>
          {board.available ? 'Live' : 'Offline'}
        </Badge>
      </div>

      {board.quotes.length === 0 ? (
        <p className="ti-prices-note" role="status">
          Price data unavailable. Live pricing connects when the market-data feed goes live.
        </p>
      ) : (
        <ul className="ti-price-list" aria-label="Sample currency and asset prices">
          {board.quotes.map((quote) => (
            <PriceRow quote={quote} key={quote.symbol} />
          ))}
        </ul>
      )}

      <p className="ti-prices-note">{board.statusLabel} — not execution-grade. Symbols stream live when the feed connects.</p>
    </section>
  );
}

function PriceRow({ quote }: { quote: Quote }) {
  const up = quote.changePct >= 0;
  const changeLabel = `${up ? '+' : ''}${quote.changePct.toFixed(2)}%`;
  return (
    <li className="ti-price-row">
      <span className="ti-price-pair">{quote.symbol}</span>
      <Sparkline series={quote.series} up={up} />
      <span className="ti-price-val mono-num">{quote.last}</span>
      <span className={`ti-price-chg ${up ? 'ti-up' : 'ti-down'}`}>{changeLabel}</span>
    </li>
  );
}

/** Pure SVG sparkline over a normalized (0–1) series. Compositor-friendly, no JS. */
function Sparkline({ series, up }: { series: readonly number[]; up: boolean }) {
  if (series.length < 2) return <span className="ti-spark" aria-hidden="true" />;

  const width = 60;
  const height = 22;
  const step = width / (series.length - 1);
  const points = series
    .map((value, index) => {
      const x = index * step;
      // y inverts because SVG origin is top-left; pad 2px so strokes aren't clipped.
      const y = height - 2 - value * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      className="ti-spark"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        stroke={up ? 'var(--pos-on-dark)' : 'var(--neg-on-dark)'}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
