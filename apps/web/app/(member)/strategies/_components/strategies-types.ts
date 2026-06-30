/**
 * Strategy Library (M10 / PRD §10) — domain types + defensive plan/lock helpers.
 *
 * The dataset itself lives in {@link ./strategies-data}. Keeping types and the
 * pure access helpers here keeps the data file focused on content and under the
 * 800-line cap.
 *
 * Educational framing only: a "playbook" documents a repeatable, rule-based
 * process. Nothing here is a signal, a recommendation, or a profit claim
 * (PROJECT.md §10, §6.7). Copy is written accordingly.
 */

/**
 * Subscription plan literal. Mirrors `@fxunlock/entitlements`'s `Plan` type so
 * this surface stays in lockstep. The viewer's actual plan is read server-side
 * by the shared `@/lib/entitlements/plan` `getViewerPlan` helper and validated
 * through {@link resolvePlan}. The strategy library only distinguishes Basic
 * (some playbooks locked) from Pro/Elite (all unlocked).
 */
export type Plan = 'basic' | 'pro' | 'elite';

/** The five filterable strategy categories (PRD §10: All/Technical/Smart Money/Trend/Range). */
export type StrategyCategory = 'Technical' | 'Smart Money' | 'Trend' | 'Range';

/** Difficulty rating shown on each card. Educational signposting, not a promise. */
export type StrategyDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/** Plan tier required to open a playbook in full. */
export type StrategyAccess = 'basic' | 'pro';

/** A worked example illustrating the process on a hypothetical, anonymized setup. */
export interface PlaybookExample {
  readonly title: string;
  readonly walkthrough: string;
}

/** A single related lesson pointer (deep-link target lives in the courses module). */
export interface RelatedLesson {
  readonly label: string;
  readonly tier: string;
}

/** A self-check item in the playbook's process checklist / quiz. */
export interface ChecklistItem {
  readonly prompt: string;
  readonly detail: string;
}

/**
 * The full educational body of a playbook. Every field is process-oriented
 * teaching content — concept, rules, criteria, invalidation, risk discipline —
 * never a directive to take a position.
 */
export interface PlaybookBody {
  /** What the pattern is and the market behavior it tries to read. */
  readonly concept: string;
  /** The ordered, mechanical rules that define the process. */
  readonly rules: readonly string[];
  /** Conditions that must all be present before the setup is considered valid. */
  readonly setupCriteria: readonly string[];
  /** What invalidates the idea — the line in the sand for the thesis. */
  readonly invalidation: readonly string[];
  /** Risk-management discipline framed educationally (no position sizing advice). */
  readonly riskNotes: readonly string[];
  /** Hypothetical, anonymized worked examples of the process. */
  readonly examples: readonly PlaybookExample[];
  /** Lessons in the curriculum that teach the underlying concepts. */
  readonly relatedLessons: readonly RelatedLesson[];
  /** Process checklist doubling as a self-quiz before applying the playbook. */
  readonly checklist: readonly ChecklistItem[];
}

/** A complete strategy playbook entry — card metadata plus its full body. */
export interface Strategy {
  /** URL slug — drives the detail route `/strategies/[slug]`. */
  readonly slug: string;
  readonly name: string;
  readonly category: StrategyCategory;
  readonly difficulty: StrategyDifficulty;
  /** Lesson count surfaced on the card and detail header. */
  readonly lessons: number;
  /** One-line card description. */
  readonly summary: string;
  /** Minimum plan required to open the playbook ('basic' = free to all). */
  readonly access: StrategyAccess;
  /** Banner gradient index (cycles through the design's four banner gradients). */
  readonly bannerIndex: number;
  readonly body: PlaybookBody;
}

/** A filter tab: its label and the category it maps to (`null` = All). */
export interface FilterTab {
  readonly label: string;
  readonly category: StrategyCategory | null;
}

/** The filter tabs rendered above the grid (PRD §10). */
export const FILTER_TABS: readonly FilterTab[] = Object.freeze([
  { label: 'All', category: null },
  { label: 'Technical', category: 'Technical' },
  { label: 'Smart Money', category: 'Smart Money' },
  { label: 'Trend', category: 'Trend' },
  { label: 'Range', category: 'Range' },
]);

/**
 * Resolve the active filter category from a raw URL search-param value.
 * Unknown / missing values fall back to "All" (`null`) — never throws.
 */
export function resolveCategory(raw: string | undefined): StrategyCategory | null {
  if (!raw) return null;
  const match = FILTER_TABS.find((t) => t.category === raw);
  return match?.category ?? null;
}

/**
 * Defensive plan validation. Narrows an already-resolved plan (from the shared
 * `getViewerPlan` server read) to this surface's literal; anything unrecognized
 * degrades to the most restrictive plan, so the UI never *grants* access it
 * cannot prove. The server-side gate is authoritative — the UI lock is a hint
 * (PROJECT.md §6.1, ENGINEERING.md "UI locks are hints only").
 */
export function resolvePlan(candidate?: string | null): Plan {
  if (candidate === 'pro' || candidate === 'elite') return candidate;
  return 'basic';
}

/**
 * Whether a strategy is locked for the given plan. A `'pro'`-access playbook is
 * locked only for Basic; Pro/Elite see everything. Pure and total.
 */
export function isLocked(strategy: Strategy, plan: Plan): boolean {
  if (strategy.access === 'basic') return false;
  return plan === 'basic';
}

/** Filter a strategy list to a category (or all when `category` is `null`). */
export function filterByCategory(
  strategies: readonly Strategy[],
  category: StrategyCategory | null,
): readonly Strategy[] {
  if (category === null) return strategies;
  return strategies.filter((s) => s.category === category);
}
