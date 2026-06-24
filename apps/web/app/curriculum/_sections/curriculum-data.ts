/**
 * The five-tier FX Academy curriculum (PROJECT.md §8.4 / design/public/curriculum.html).
 *
 * Plan access here is a presentation *hint* only. Entitlements are decided and
 * verified server-side (PROJECT.md §6 — "UI locks are hints"); this data drives
 * the marketing path UI and the locked-state messaging, nothing gated.
 */

/** Which plan tiers grant access to a curriculum tier. */
export type TierAccess = 'basic' | 'pro';

export interface CurriculumTier {
  /** Tier name shown as the card heading. */
  readonly title: string;
  /** Difficulty / level label. */
  readonly level: string;
  /** Approximate total time-on-content. */
  readonly duration: string;
  /** Number of modules (derived count is also rendered from `modules.length`). */
  readonly moduleCount: number;
  /** Lesson count for the tier. */
  readonly lessonCount: number;
  /** What the tier covers — one entry per module. */
  readonly modules: readonly string[];
  /** Lowest plan that unlocks the tier. */
  readonly access: TierAccess;
  /** Whether finishing the tier issues a certificate. */
  readonly certificate: boolean;
  /** One-line summary of the tier's intent. */
  readonly summary: string;
}

export const CURRICULUM_TIERS: readonly CurriculumTier[] = [
  {
    title: 'Entry',
    level: 'Foundations',
    duration: '3.5 hrs',
    moduleCount: 5,
    lessonCount: 12,
    modules: [
      'What is forex?',
      'Currency pairs',
      'How markets move',
      'Brokers, spreads, pips',
      'Risk basics',
    ],
    access: 'basic',
    certificate: true,
    summary: 'First principles — how the market works before you ever place an order.',
  },
  {
    title: 'Beginner',
    level: 'Beginner',
    duration: '5 hrs',
    moduleCount: 5,
    lessonCount: 16,
    modules: [
      'Candlesticks',
      'Support & resistance',
      'Chart reading',
      'Order types',
      'Basic trade planning',
    ],
    access: 'basic',
    certificate: true,
    summary: 'Read a chart with intent and structure a plan before you act.',
  },
  {
    title: 'Intermediate',
    level: 'Intermediate',
    duration: '6.5 hrs',
    moduleCount: 5,
    lessonCount: 18,
    modules: [
      'Strategy building',
      'Confluence',
      'Market sessions',
      'Trade management',
      'Risk-to-reward',
    ],
    access: 'pro',
    certificate: true,
    summary: 'Turn isolated concepts into a repeatable, risk-defined approach.',
  },
  {
    title: 'Advanced',
    level: 'Advanced',
    duration: '8 hrs',
    moduleCount: 5,
    lessonCount: 20,
    modules: [
      'Institutional concepts',
      'Liquidity',
      'Market structure',
      'ICT-style concepts',
      'Advanced execution',
    ],
    access: 'pro',
    certificate: true,
    summary: 'Study how larger participants move price and how structure forms.',
  },
  {
    title: 'Psychology',
    level: 'All levels',
    duration: '4 hrs',
    moduleCount: 5,
    lessonCount: 14,
    modules: [
      'Discipline',
      'Managing bias',
      'Revenge trading',
      'Overtrading',
      'Journaling mindset',
    ],
    access: 'pro',
    certificate: true,
    summary: 'The discipline layer that runs underneath every other tier.',
  },
] as const;

/** The repeating learn-loop framing shown above the path. */
export interface LoopStep {
  readonly title: string;
  readonly body: string;
}

export const LEARNING_LOOP: readonly LoopStep[] = [
  { title: 'Learn', body: 'Short, structured lessons that build on each other — no random tips.' },
  { title: 'Practice', body: 'Apply each concept against real charts before moving on.' },
  { title: 'Quiz', body: 'Check understanding with a short quiz at the end of every module.' },
  { title: 'Reflect', body: 'Journal the decision and review it later — process over outcome.' },
] as const;
