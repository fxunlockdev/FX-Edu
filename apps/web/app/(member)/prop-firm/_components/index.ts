// Prop Firm Prep (M13) — component + logic barrel.

export { computeReadiness, MIN_TRADES_FOR_SCORE, DISCIPLINED_RISK_PERCENT } from './readiness';
export type { Readiness, ReadinessSignal } from './readiness';

export { PREP_STAGES, EVALUATION_CHECKLIST } from './prep-data';
export type { PrepStage, ChecklistItem } from './prep-data';

export {
  DEFAULT_CONSTRAINTS,
  CONSTRAINTS_STORAGE_KEY,
  normalizeConstraints,
  readConstraints,
  writeConstraints,
} from './constraints';
export type { PropFirmConstraints } from './constraints';

export { deriveSampleTrade, PLACEHOLDER_SAMPLE } from './sample-trade';
export type { SampleTrade } from './sample-trade';

export { ConstraintsConfig } from './ConstraintsConfig';

export { UpgradeLock } from './UpgradeLock';
