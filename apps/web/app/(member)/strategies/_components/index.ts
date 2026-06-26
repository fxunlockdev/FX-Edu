// Strategy Library (M10) — internal component/data barrel.

export { StrategyFilters } from './StrategyFilters';
export { PlaybookContent } from './PlaybookBody';
export { STRATEGIES, getStrategyBySlug, allStrategySlugs } from './strategies-data';
export {
  FILTER_TABS,
  filterByCategory,
  isLocked,
  resolveCategory,
  resolvePlan,
} from './strategies-types';
export type {
  ChecklistItem,
  FilterTab,
  PlaybookBody,
  PlaybookExample,
  Plan,
  RelatedLesson,
  Strategy,
  StrategyAccess,
  StrategyCategory,
  StrategyDifficulty,
} from './strategies-types';
