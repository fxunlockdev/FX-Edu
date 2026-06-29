/**
 * Market News + Live Prices STUB data (M11 / PROJECT.md §8.10, §11).
 *
 * The real providers are NOT wired. Per §11 ("provider data cached + attributed;
 * graceful degradation if provider down") and §18 ("price widget degrades
 * gracefully"), this surface ships honest sample data clearly labeled
 * non-execution-grade. Nothing here is live, real-time, or tradeable.
 *
 *   • Market news  → TODO: wire Trading Economics (economic calendar / macro,
 *                    impact rating, attribution + kill switch, Redis cache).
 *   • Live prices  → TODO: wire Polygon (FX + crypto snapshots/history,
 *                    server-side cache, kill switch, "educational context" label).
 *
 * `available` flags below let the UI render the designed "data unavailable" note
 * without inventing live numbers — flip them when the providers go live.
 */

export type NewsImpact = 'high' | 'medium' | 'low';

export interface NewsItem {
  readonly id: string;
  readonly headline: string;
  readonly impact: NewsImpact;
  /** Provider/source label (attribution requirement, §11). */
  readonly source: string;
  /** Asset/market the item touches, e.g. "USD", "Gold". */
  readonly asset: string;
  /** ISO timestamp (drives "time since"). */
  readonly publishedAt: string;
}

export interface NewsFeed {
  /** Flip to `true` only when Trading Economics is wired + within license. */
  readonly available: boolean;
  readonly items: readonly NewsItem[];
}

/** Chip tone per impact level (maps to Lumina chip classes). */
export const IMPACT_TONE: Record<NewsImpact, 'neg' | 'warn' | 'outline'> = Object.freeze({
  high: 'neg',
  medium: 'warn',
  low: 'outline',
});

export const NEWS_FEED: NewsFeed = Object.freeze({
  // Sample feed renders so the panel reads as designed; clearly labeled as
  // sample/educational in the UI. The provider read replaces this wholesale.
  available: false,
  items: Object.freeze([
    {
      id: 'news-cpi',
      headline: 'US CPI release scheduled — elevated volatility expected',
      impact: 'high' as NewsImpact,
      source: 'Sample · Trading Economics',
      asset: 'USD',
      publishedAt: '2026-06-26T08:10:00.000Z',
    },
    {
      id: 'news-ecb',
      headline: 'ECB officials reiterate data-dependent stance in remarks',
      impact: 'medium' as NewsImpact,
      source: 'Sample · Trading Economics',
      asset: 'EUR',
      publishedAt: '2026-06-26T06:40:00.000Z',
    },
    {
      id: 'news-gold',
      headline: 'Gold holds range ahead of inflation print',
      impact: 'medium' as NewsImpact,
      source: 'Sample · Trading Economics',
      asset: 'Gold',
      publishedAt: '2026-06-26T05:15:00.000Z',
    },
    {
      id: 'news-boe',
      headline: 'UK retail sales come in line with expectations',
      impact: 'low' as NewsImpact,
      source: 'Sample · Trading Economics',
      asset: 'GBP',
      publishedAt: '2026-06-26T03:00:00.000Z',
    },
  ] satisfies NewsItem[]),
});

export interface Quote {
  readonly symbol: string;
  /** Last sample value, formatted for display. */
  readonly last: string;
  /** Percent change over the sample window. */
  readonly changePct: number;
  /**
   * Normalized sample series (0–1) used to draw a sparkline. Deterministic and
   * static — these are illustrative, not live ticks.
   */
  readonly series: readonly number[];
}

export interface PriceBoard {
  /** Flip to `true` only when Polygon is wired + within entitlement. */
  readonly available: boolean;
  /** Honest freshness label shown in the UI. */
  readonly statusLabel: string;
  readonly quotes: readonly Quote[];
}

/** Build a normalized (0–1) series from raw sample points for the sparkline. */
function normalize(points: readonly number[]): readonly number[] {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  return points.map((p) => (p - min) / span);
}

export const PRICE_BOARD: PriceBoard = Object.freeze({
  available: false,
  statusLabel: 'Delayed · educational sample',
  quotes: Object.freeze([
    {
      symbol: 'EUR/USD',
      last: '1.0842',
      changePct: 0.18,
      series: normalize([1.081, 1.0805, 1.0818, 1.0829, 1.0824, 1.0838, 1.0842]),
    },
    {
      symbol: 'GBP/USD',
      last: '1.2698',
      changePct: -0.12,
      series: normalize([1.2712, 1.2708, 1.2701, 1.2705, 1.2695, 1.2699, 1.2698]),
    },
    {
      symbol: 'USD/JPY',
      last: '157.34',
      changePct: 0.27,
      series: normalize([156.9, 157.0, 157.12, 157.05, 157.22, 157.3, 157.34]),
    },
    {
      symbol: 'XAU/USD',
      last: '2348.6',
      changePct: 0.41,
      series: normalize([2338.0, 2340.5, 2339.2, 2343.0, 2345.5, 2347.0, 2348.6]),
    },
    {
      symbol: 'BTC/USD',
      last: '61240',
      changePct: -0.86,
      series: normalize([61780, 61560, 61410, 61620, 61380, 61290, 61240]),
    },
    {
      symbol: 'AUD/USD',
      last: '0.6671',
      changePct: 0.09,
      series: normalize([0.6664, 0.6668, 0.6662, 0.6669, 0.6667, 0.667, 0.6671]),
    },
  ]),
});
