/**
 * Plan (entitlement) derivation for the AI Tutor (M7 / PROJECT.md §7, §6.1–6.2).
 * The AI Tutor is Pro-only (§7 🔒). There is no subscription/entitlement data
 * wired at runtime yet, so we DEFENSIVELY default every caller to Basic and
 * render the designed Pro upgrade-lock. The UI lock is only a hint — the real
 * server-side entitlement gate lands with the entitlements API (§6.2).
 *
 * Returns a `Plan` value (not a literal) so the Pro branch in the page is real,
 * type-reachable code that compiles unchanged once the flag is fed by the
 * entitlements API.
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
