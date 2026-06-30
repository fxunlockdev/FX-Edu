/**
 * Shared, SERVER-ONLY entitlement (plan) resolution for the member surface.
 *
 * SERVER-ONLY: this module depends on `@/lib/supabase/server` (which reads
 * `next/headers` `cookies()`), so it is only ever importable from RSC / Route
 * Handlers / Server Actions — never a client component.
 *
 * This is the single place the web app reads a viewer's plan from the deployed
 * `subscriptions` table. Every member module derives its plan/lock state from
 * {@link getViewerPlan} + {@link isPro}/{@link isElite} — there is no per-module
 * hardcoded plan any more.
 *
 * The server-side gate is authoritative; the UI lock is only a hint
 * (PROJECT.md §6.1, ENGINEERING.md "UI locks are hints only"). A forged client
 * flag still cannot obtain gated content, because the API and RLS re-check.
 *
 * Defensive by construction: any failure (no user, undeployed table, malformed
 * row, network blip) resolves to the most restrictive plan — `'basic'` — so the
 * UI can never *grant* access it cannot prove.
 */
import {
  isSubscriptionActive,
  type Plan,
  type SubscriptionStatus,
} from '@fxunlock/entitlements';
import { createClient } from '@/lib/supabase/server';

export type { Plan } from '@fxunlock/entitlements';

/** Known plan literals, used to narrow an untrusted `plan_id` from the row. */
const KNOWN_PLANS: ReadonlySet<Plan> = new Set<Plan>(['basic', 'pro', 'elite']);

/** Statuses the entitlements policy understands (DB may also store `'none'`). */
const KNOWN_STATUSES: ReadonlySet<SubscriptionStatus> = new Set<SubscriptionStatus>([
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'unpaid',
  'paused',
]);

/** Narrow an untrusted `plan_id` to a known {@link Plan}, or `null`. */
function toPlan(raw: unknown): Plan | null {
  return typeof raw === 'string' && KNOWN_PLANS.has(raw as Plan) ? (raw as Plan) : null;
}

/**
 * Narrow an untrusted `status` to a {@link SubscriptionStatus} the policy
 * understands. `'none'` and anything unrecognized return `null` → treated as
 * inactive (Basic) by the caller.
 */
function toStatus(raw: unknown): SubscriptionStatus | null {
  return typeof raw === 'string' && KNOWN_STATUSES.has(raw as SubscriptionStatus)
    ? (raw as SubscriptionStatus)
    : null;
}

/**
 * Resolve the current viewer's plan from their active subscription.
 *
 * - No authenticated user → `'basic'`.
 * - Reads the RLS-scoped `subscriptions` row (`plan_id`, `status`) for the user.
 * - Returns the mapped {@link Plan} only when the subscription is ACTIVE
 *   ({@link isSubscriptionActive}) AND `plan_id` maps to a known plan.
 * - Any error, missing row, inactive status, or unknown plan → `'basic'`.
 *
 * Total + defensive: never throws; safe even before the table is deployed.
 */
export async function getViewerPlan(): Promise<Plan> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return 'basic';

    const { data } = await supabase
      .from('subscriptions')
      .select('plan_id,status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) return 'basic';

    const status = toStatus((data as { status?: unknown }).status);
    const plan = toPlan((data as { plan_id?: unknown }).plan_id);

    if (status !== null && plan !== null && isSubscriptionActive(status)) {
      return plan;
    }

    return 'basic';
  } catch {
    // Table not deployed, transient read failure, etc. — fail closed to Basic.
    return 'basic';
  }
}

/** Whether the plan unlocks Pro surfaces (Pro or Elite). Pure + total. */
export function isPro(plan: Plan): boolean {
  return plan === 'pro' || plan === 'elite';
}

/** Whether the plan unlocks Elite surfaces. Pure + total. */
export function isElite(plan: Plan): boolean {
  return plan === 'elite';
}
