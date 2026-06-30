/**
 * Plan (entitlement) literal + the pure Pro check for the Learning Paths library
 * and Lesson Player (M3 / PROJECT.md §6.1–6.2, §8.4).
 *
 * The viewer's actual plan is read server-side from the shared entitlements
 * helper (`@/lib/entitlements/plan` `getViewerPlan`). This module keeps only the
 * PURE `isPro` predicate the card-model builder and its tests depend on.
 *
 * Course unlock is a UI HINT only — the server-side gate is authoritative
 * (§8.4: "Course unlocks entitlement-checked server-side").
 */
export type Plan = 'basic' | 'pro' | 'elite';

/** Whether the plan unlocks Pro courses (Pro or Elite). Pure + total. */
export function isPro(plan: Plan): boolean {
  return plan !== 'basic';
}
