/**
 * Elite-tier (entitlement) derivation for Elite Cohort & Coaching (M21 /
 * PROJECT.md §9 module 21, §6.1–6.2). Elite is the high-touch tier — and per the
 * pricing (§5: "Elite from $147 waitlist") it is COMING SOON: there is no Elite
 * billing or entitlement data wired at runtime yet.
 *
 * So we DEFENSIVELY default every caller to not-Elite and render the designed
 * "coming soon / join the waitlist" surface instead of any Elite content. The UI
 * lock is only a hint — the real server-side entitlement gate lands with the
 * entitlements API (§6.2). `deriveEliteAccess` returns an {@link EliteAccess}
 * value (not a literal) so the Elite branch stays real, type-reachable code that
 * compiles unchanged once the flag is fed by the entitlements API.
 */

export type EliteTier = 'none' | 'pro' | 'elite';

export interface EliteAccess {
  /** Whether the caller is entitled to Elite content (coaching/Q&A/early access). */
  readonly isElite: boolean;
  /** The caller's current tier — used to tailor the upgrade vs. waitlist copy. */
  readonly tier: EliteTier;
}

/**
 * Resolve the caller's Elite access. Elite is not yet sellable (waitlist /
 * coming-soon), so this defaults to not-Elite until the entitlements API is
 * runtime-wired.
 *
 * @param _userId reserved — the entitlements lookup will key on it.
 */
export function deriveEliteAccess(_userId: string | undefined): EliteAccess {
  // TODO: read plan from /entitlements once the API is runtime-wired.
  // When Elite ships, an entitled caller resolves to { isElite: true, tier: 'elite' }.
  return { isElite: false, tier: 'none' };
}
