/**
 * Trade Ideas (M11 / PROJECT.md §8.10, §11) — domain types + defensive
 * plan/filter helpers.
 *
 * The seed dataset lives in {@link ./ideas-data}. Keeping the types and pure
 * access helpers here keeps the data file focused on content and under the
 * 400-line cap.
 *
 * EDUCATIONAL FRAMING ONLY. A trade "idea" here is an educator-published worked
 * EXAMPLE of how markets are analyzed — never a signal, recommendation, or
 * financial advice (§11 🔒, §6.7). `bias` is an educational *view*, not a
 * buy/sell directive. Copy and types are written accordingly: there is no
 * "entry price to take" — there is an `entryArea` (where the example would have
 * been considered), an `invalidation` (the line that voids the thesis) and an
 * `objective` (what the example was reading toward).
 */

/**
 * Subscription plan literal. Mirrors `@fxunlock/entitlements`'s `Plan` shape so
 * this surface stays in lockstep without taking a hard package dependency before
 * the entitlements read is wired. Trade Ideas is Pro-gated; Basic sees the
 * designed upgrade surface (§11 🔒 "Pro-only unless teaser configured").
 *
 * TODO: read plan from /entitlements — replace {@link resolvePlan} with the real
 * server-side entitlement read once the API route exists. Until then we default
 * to the most restrictive plan so paid content is never leaked by the UI.
 */
export type Plan = 'basic' | 'pro' | 'elite';

/** The educational directional view. Framed as a *view*, never an instruction. */
export type IdeaBias = 'long' | 'short' | 'neutral';

/** Human label + chip tone for each bias. Keeps copy non-directive. */
export interface BiasMeta {
  readonly label: string;
  /** Maps to a `@fxunlock/ui` Badge tone. */
  readonly tone: 'pos' | 'neg' | 'outline';
}

export const BIAS_META: Record<IdeaBias, BiasMeta> = Object.freeze({
  long: { label: 'Long bias', tone: 'pos' },
  short: { label: 'Short bias', tone: 'neg' },
  neutral: { label: 'Neutral', tone: 'outline' },
});

/** A pointer to the lesson/playbook the idea is teaching toward. */
export interface RelatedReference {
  readonly label: string;
  /** Internal route (e.g. a strategy playbook). */
  readonly href: string;
}

/**
 * A single educator-published trade idea — an educational example. Every field
 * is teaching content: where the example was considered, what voids it, and what
 * it was reading toward. No "take this trade" field exists by design.
 */
export interface TradeIdea {
  readonly id: string;
  /** Educator display name. */
  readonly educator: string;
  /** Two-letter monogram for the educator avatar. */
  readonly initials: string;
  /** ISO timestamp the example was published (drives "time since"). */
  readonly publishedAt: string;
  /** Instrument/pair, e.g. "EUR/USD". */
  readonly instrument: string;
  /** Educational directional view. */
  readonly bias: IdeaBias;
  /** Timeframe label, e.g. "Swing · 4H". */
  readonly timeframe: string;
  /** The analysis note — process-oriented teaching, never a directive. */
  readonly note: string;
  /** Where the example would have been *considered* (educational area, not an order). */
  readonly entryArea: string;
  /** The level/condition that voids the educational thesis. */
  readonly invalidation: string;
  /** What the example was reading toward. */
  readonly objective: string;
  /** Strategy/concept tag used for filtering. */
  readonly tag: string;
  /** Related lesson or playbook to study the framework. */
  readonly related: RelatedReference;
  /** Banner gradient index (cycles the design's dark-forest blends). */
  readonly chartBanner: number;
}

/** Distinct filterable axes derived from the dataset (all URL-state driven). */
export interface IdeaFacets {
  readonly instruments: readonly string[];
  readonly timeframes: readonly string[];
  readonly educators: readonly string[];
  readonly tags: readonly string[];
}

/** The active filter selection, resolved from URL search params. */
export interface IdeaFilterState {
  readonly instrument: string | null;
  readonly timeframe: string | null;
  readonly educator: string | null;
  readonly tag: string | null;
}

/** The four URL-state filter keys, in render order. */
export const FILTER_KEYS = ['instrument', 'timeframe', 'educator', 'tag'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

/**
 * Defensive plan resolution. Until the real `/entitlements` read is wired, this
 * always returns the most restrictive plan so the UI never *grants* access it
 * cannot prove. Server-side authorization remains the real gate — the UI lock is
 * a hint (PROJECT.md §6.1, ENGINEERING.md "UI locks are hints only").
 *
 * Accepts an optional already-resolved plan and validates it; anything
 * unrecognized degrades to `'basic'`.
 *
 * TODO: read plan from /entitlements — call the entitlement service here and map
 * its `Plan` onto this literal.
 */
export function resolvePlan(candidate?: string | null): Plan {
  if (candidate === 'pro' || candidate === 'elite') return candidate;
  return 'basic';
}

/** Whether the Trade Ideas surface is locked for the given plan. Pure + total. */
export function isLocked(plan: Plan): boolean {
  return plan === 'basic';
}

/** First value of a possibly-array search param; `undefined` when absent. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Resolve the active filter state from raw URL params. Any value that does not
 * match a real facet degrades to `null` ("All") — never throws. This keeps the
 * filtered view shareable and back-button friendly while staying defensive
 * against hand-edited query strings.
 */
export function resolveFilterState(
  params: Record<string, string | string[] | undefined>,
  facets: IdeaFacets,
): IdeaFilterState {
  const pick = (key: FilterKey, allowed: readonly string[]): string | null => {
    const raw = firstParam(params[key]);
    if (raw && allowed.includes(raw)) return raw;
    return null;
  };

  return {
    instrument: pick('instrument', facets.instruments),
    timeframe: pick('timeframe', facets.timeframes),
    educator: pick('educator', facets.educators),
    tag: pick('tag', facets.tags),
  };
}

/** Distinct, stable-sorted facet values derived from the dataset. */
export function deriveFacets(ideas: readonly TradeIdea[]): IdeaFacets {
  const distinct = (values: readonly string[]): readonly string[] =>
    Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

  return Object.freeze({
    instruments: distinct(ideas.map((i) => i.instrument)),
    timeframes: distinct(ideas.map((i) => i.timeframe)),
    educators: distinct(ideas.map((i) => i.educator)),
    tags: distinct(ideas.map((i) => i.tag)),
  });
}

/** Filter the idea list by the active selection. Pure; empty result is valid. */
export function filterIdeas(
  ideas: readonly TradeIdea[],
  state: IdeaFilterState,
): readonly TradeIdea[] {
  return ideas.filter(
    (idea) =>
      (state.instrument === null || idea.instrument === state.instrument) &&
      (state.timeframe === null || idea.timeframe === state.timeframe) &&
      (state.educator === null || idea.educator === state.educator) &&
      (state.tag === null || idea.tag === state.tag),
  );
}

/**
 * Compact "time since" label from an ISO timestamp relative to `now`. Educational
 * recency cue only; degrades to '' on an unparseable date rather than throwing.
 */
export function timeSince(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.max(0, Math.floor((now.getTime() - then) / 1000));
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
