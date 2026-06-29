// Trade Ideas, Market News & Live Prices (M11) — internal component/data barrel.

export { IdeaFilters } from './IdeaFilters';
export { IdeaCard } from './IdeaCard';
export { MarketNewsPanel } from './MarketNewsPanel';
export { LivePricesPanel } from './LivePricesPanel';
export { UpgradeGate } from './UpgradeGate';

export { TRADE_IDEAS } from './ideas-data';
export {
  BIAS_META,
  FILTER_KEYS,
  deriveFacets,
  filterIdeas,
  firstParam,
  isLocked,
  resolveFilterState,
  resolvePlan,
  timeSince,
} from './ideas-types';
export type {
  BiasMeta,
  FilterKey,
  IdeaBias,
  IdeaFacets,
  IdeaFilterState,
  Plan,
  RelatedReference,
  TradeIdea,
} from './ideas-types';

export { IMPACT_TONE, NEWS_FEED, PRICE_BOARD } from './market-data';
export type { NewsFeed, NewsImpact, NewsItem, PriceBoard, Quote } from './market-data';
