/**
 * Plan (entitlement) derivation for the Member Dashboard (M18 / PROJECT.md §18,
 * §6.1–6.2). There is no subscription/entitlement data wired at runtime yet, so
 * we DEFENSIVELY default every caller to Basic and render Pro surfaces as the
 * designed locked/upgrade states. The UI lock is only a hint — the real
 * server-side entitlement gate lands with the entitlements API (§6.2).
 *
 * `derivePlan` returns a `Plan` value (not a literal) so the Pro branches in the
 * page are real, type-reachable code that compiles unchanged once the flag is
 * fed by the entitlements API.
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
