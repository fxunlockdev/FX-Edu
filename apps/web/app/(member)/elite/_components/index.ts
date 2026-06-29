// Elite Cohort & Coaching (M21) — component + logic barrel.

export { deriveEliteAccess } from './plan';
export type { EliteAccess, EliteTier } from './plan';

export {
  ELITE_BENEFITS,
  COACHING_CALLS,
  ANSWERED_QUESTIONS,
  EARLY_ACCESS,
  formatCallTime,
} from './elite-data';
export type {
  EliteBenefit,
  CoachingCall,
  AnsweredQuestion,
  EarlyAccessItem,
} from './elite-data';

export { EliteOverview } from './EliteOverview';
export { CoachingCalls } from './CoachingCalls';
export { EducatorQa } from './EducatorQa';
export { EarlyAccess } from './EarlyAccess';
export { WaitlistGate } from './WaitlistGate';
export { AskQuestionForm } from './AskQuestionForm';
