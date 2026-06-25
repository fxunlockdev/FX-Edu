/**
 * Checkout plan resolution. Reuses the marketing `PLANS` catalogue (single
 * source of truth — prices live in one place: pricing/_sections/plans.ts) and
 * exposes helpers to pick the plan a `?plan=` query refers to, defaulting to
 * Pro (the recommended tier) when the value is missing or unknown.
 */

import { PLANS, type Plan } from '@/app/pricing/_sections/plans';

export type { Plan } from '@/app/pricing/_sections/plans';

const DEFAULT_PLAN_ID: Plan['id'] = 'pro';

/** Resolves an untrusted `?plan=` value to a known plan (defaults to Pro). */
export function resolvePlan(raw: string | string[] | null | undefined): Plan {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const match = PLANS.find((p) => p.id === value);
  return match ?? plan(DEFAULT_PLAN_ID);
}

/** Looks up a plan by id; throws only on a programmer error (unknown literal). */
export function plan(id: Plan['id']): Plan {
  const found = PLANS.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Unknown plan id: ${id}`);
  }
  return found;
}

/** The plans selectable at checkout (Elite is waitlist-only — excluded). */
export const SELECTABLE_PLANS: ReadonlyArray<Plan> = PLANS.filter((p) => !p.comingSoon);
