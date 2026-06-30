/**
 * Elite-tier (entitlement) access for Elite Cohort & Coaching (M21 /
 * PROJECT.md §9 module 21, §6.1–6.2).
 *
 * The viewer's plan is read server-side from the shared entitlements helper
 * (`@/lib/entitlements/plan` `getViewerPlan`) and Elite access is decided with
 * its pure `isElite` predicate. Per the pricing (§5: "Elite from $147 waitlist")
 * Elite is COMING SOON, so in practice this resolves to not-Elite until Elite
 * billing/entitlement rows exist — and any failure defaults DEFENSIVELY to
 * not-Elite so the "join the waitlist" surface renders instead of Elite content.
 *
 * The server-side gate is authoritative; the UI lock is only a hint (§6.1).
 */
import { getViewerPlan, isElite, type Plan } from '@/lib/entitlements/plan';

export type EliteTier = 'none' | 'pro' | 'elite';

export interface EliteAccess {
  /** Whether the caller is entitled to Elite content (coaching/Q&A/early access). */
  readonly isElite: boolean;
  /** The caller's current tier — used to tailor the upgrade vs. waitlist copy. */
  readonly tier: EliteTier;
}

/** Map a resolved {@link Plan} onto the Elite tier shown in waitlist copy. */
function tierFromPlan(plan: Plan): EliteTier {
  if (plan === 'elite') return 'elite';
  if (plan === 'pro') return 'pro';
  return 'none';
}

/**
 * Resolve the caller's Elite access from their server-read plan. Defaults
 * DEFENSIVELY to not-Elite (the shared helper returns Basic on any error), so a
 * caller whose Elite entitlement cannot be proven sees the waitlist gate.
 */
export async function deriveEliteAccess(): Promise<EliteAccess> {
  const plan = await getViewerPlan();
  return { isElite: isElite(plan), tier: tierFromPlan(plan) };
}
