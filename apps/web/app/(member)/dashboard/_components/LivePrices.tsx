'use client';

/**
 * Live prices card — interactive leaf for the Member Dashboard (M18 / §18,
 * module 11 "Trade Ideas, News, Prices").
 *
 * The market-data provider is NOT wired yet (module 11 is pending), so this card
 * MUST degrade gracefully rather than invent ticking numbers (§18 "Done when:
 * price widget degrades gracefully"). It renders a calm, honest "data
 * unavailable" stub on a dark terminal-style surface that matches the design,
 * showing the symbols we will stream with a clear status — no fabricated prices.
 *
 * It is a client component only so the (later) provider connection can live
 * client-side without a refactor; today it holds no live state. When the feed
 * lands, swap the placeholder body for the streaming ticker.
 */
const PAIRS: ReadonlyArray<string> = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'BTC/USD', 'AUD/USD'];

export function LivePrices() {
  return (
    <article className="mod mod-dark dash-px col-5" aria-labelledby="dash-px-h">
      <span className="dash-glow" aria-hidden="true" />
      <div className="mod-head">
        <h3 id="dash-px-h" className="mod-title-on-dark">
          Live prices
        </h3>
        <span className="chip dash-chip-muted">
          <span className="dot" aria-hidden="true" /> Offline
        </span>
      </div>

      <ul className="dash-px-list" aria-label="Currency pairs (live data pending)">
        {PAIRS.map((pair) => (
          <li className="dash-px-row" key={pair}>
            <span className="dash-px-pair">{pair}</span>
            <span className="dash-px-val" aria-hidden="true">
              ——
            </span>
          </li>
        ))}
      </ul>

      <p className="dash-px-note">
        Live pricing connects when the market-data feed goes live. Symbols shown are placeholders.
      </p>
    </article>
  );
}
