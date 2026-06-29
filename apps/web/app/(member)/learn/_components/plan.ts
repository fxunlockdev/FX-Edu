/**
 * Plan (entitlement) derivation for the Learning Paths library + Lesson Player
 * (M3 / PROJECT.md §6.1–6.2, §8.4). There is no subscription/entitlement data
 * wired at runtime yet, so we DEFENSIVELY default every caller to Basic and render
 * Pro-gated courses in their designed locked/upgrade state.
 *
 * Course unlock is a UI HINT only — the real gate is server-side (§8.4: "Course
 * unlocks entitlement-checked server-side"). This flag flips in one place once the
 * entitlements API is runtime-wired.
 */
export type Plan = 'basic' | 'pro';

/**
 * Resolve the caller's plan. Defaults to Basic until the entitlements API is
 * runtime-wired.
 *
 * @param _userId reserved — the entitlements lookup will key on it.
 */
export function derivePlan(_userId: string | undefined): Plan {
  // TODO: read plan from /entitlements once the API is runtime-wired
  return 'basic';
}

export function isPro(plan: Plan): boolean {
  return plan === 'pro';
}
