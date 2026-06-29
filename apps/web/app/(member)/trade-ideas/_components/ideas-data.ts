/**
 * Trade Ideas seed dataset (M11 / PROJECT.md §8.10, §11).
 *
 * These are educator-published *educational examples* of how markets are
 * analyzed — NOT signals, recommendations, or financial advice (§11 🔒, §6.7).
 * `bias` is an educational view; `entryArea` is where the example would have been
 * *considered*, never an order to place. Every entry maps to a related lesson or
 * playbook so a member studies the framework rather than copies a call.
 *
 * This is a typed seed so the page renders meaningfully before the `trade_ideas`
 * table + admin publishing flow are wired. The live read will replace this
 * import wholesale.
 *
 * TODO: wire `trade_ideas` — read educator ideas (with disclosure-ack gate at
 * publish time, §11) from the RLS-scoped server client and map onto `TradeIdea`.
 */

import type { TradeIdea } from './ideas-types';

export const TRADE_IDEAS: readonly TradeIdea[] = Object.freeze([
  {
    id: 'idea-eurusd-sweep',
    educator: 'Marcus Vale',
    initials: 'MV',
    publishedAt: '2026-06-26T07:30:00.000Z',
    instrument: 'EUR/USD',
    bias: 'long',
    timeframe: 'Swing · 4H',
    note: 'Price swept the Asian-session lows and reclaimed the range. This example studies how a liquidity sweep can flip into a continuation read: we wait for a 4H structure shift before treating the long view as valid, rather than anticipating it. The point is reading what the market does after the sweep, not predicting the sweep.',
    entryArea: '1.0840 area',
    invalidation: 'Below the swept low',
    objective: 'Prior swing high',
    tag: 'Liquidity sweep',
    related: { label: 'Liquidity Sweep Reversal', href: '/strategies/liquidity-sweep' },
    chartBanner: 0,
  },
  {
    id: 'idea-xauusd-cpi',
    educator: 'Dana Cole',
    initials: 'DC',
    publishedAt: '2026-06-26T04:10:00.000Z',
    instrument: 'XAU/USD',
    bias: 'neutral',
    timeframe: 'Intraday · 1H',
    note: 'Ahead of CPI, volatility is elevated. This example teaches the discipline of staying flat into a scheduled release and reacting to the reaction — the market’s behavior after the print — rather than guessing the number. There is no directional view here on purpose; the lesson is patience and process around news.',
    entryArea: 'No level — flat into release',
    invalidation: 'N/A (no active thesis)',
    objective: 'React, do not predict',
    tag: 'News event',
    related: { label: 'Trading Around News', href: '/strategies/news-discipline' },
    chartBanner: 3,
  },
  {
    id: 'idea-gbpusd-supply',
    educator: 'Marcus Vale',
    initials: 'MV',
    publishedAt: '2026-06-25T09:00:00.000Z',
    instrument: 'GBP/USD',
    bias: 'short',
    timeframe: 'Swing · Daily',
    note: 'The daily rejected a clear supply zone with a bearish engulfing close. This example walks through how to read context first and seek lower-timeframe confirmation second — it is about understanding why the zone matters, not predicting an exact turn. The short view is invalidated cleanly if price reclaims the zone.',
    entryArea: '1.2710 zone',
    invalidation: 'Reclaim above the supply zone',
    objective: 'Prior demand shelf',
    tag: 'Supply zone',
    related: { label: 'Supply & Demand Zones', href: '/strategies/supply-demand' },
    chartBanner: 1,
  },
  {
    id: 'idea-usdjpy-trend',
    educator: 'Priya Nair',
    initials: 'PN',
    publishedAt: '2026-06-25T02:20:00.000Z',
    instrument: 'USD/JPY',
    bias: 'long',
    timeframe: 'Swing · 4H',
    note: 'A clean higher-high / higher-low structure on the 4H. This example studies trend continuation: it looks for a pullback into a prior breakout level and a momentum return before the long view is considered valid. The teaching focus is distinguishing a healthy pullback from a structure break.',
    entryArea: 'Pullback to breakout level',
    invalidation: 'Lower low breaks the structure',
    objective: 'Measured-move extension',
    tag: 'Trend continuation',
    related: { label: 'Trend Continuation', href: '/strategies/trend-continuation' },
    chartBanner: 2,
  },
  {
    id: 'idea-btcusd-range',
    educator: 'Dana Cole',
    initials: 'DC',
    publishedAt: '2026-06-24T18:45:00.000Z',
    instrument: 'BTC/USD',
    bias: 'neutral',
    timeframe: 'Intraday · 1H',
    note: 'Price is compressing inside a well-defined range. This example teaches range mechanics: fading the extremes back toward the mean with confirmation, and crucially recognizing when a range is about to fail. The neutral view reflects that the edge here is at the boundaries, not in the middle.',
    entryArea: 'Range extremes only',
    invalidation: 'Decisive close outside the range',
    objective: 'Opposite range boundary',
    tag: 'Range',
    related: { label: 'Range Trading', href: '/strategies/range-trading' },
    chartBanner: 3,
  },
  {
    id: 'idea-audusd-retest',
    educator: 'Priya Nair',
    initials: 'PN',
    publishedAt: '2026-06-24T11:05:00.000Z',
    instrument: 'AUD/USD',
    bias: 'long',
    timeframe: 'Swing · Daily',
    note: 'A multi-touch resistance broke and price is returning toward it. This example studies the breakout-retest process: rather than chasing the break, we ask the market to come back and show the old resistance now behaves as support before the long view is considered valid.',
    entryArea: 'Retest of broken level',
    invalidation: 'Close back below the level',
    objective: 'Next higher-timeframe level',
    tag: 'Breakout retest',
    related: { label: 'Breakout Retest', href: '/strategies/breakout-retest' },
    chartBanner: 0,
  },
]);
