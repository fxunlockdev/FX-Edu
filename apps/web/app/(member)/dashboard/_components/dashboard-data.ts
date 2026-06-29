/**
 * Pure dashboard view-model derivation for the Member Dashboard (M18 /
 * PROJECT.md §18). No I/O — the RSC page (`page.tsx`) does auth, the plan gate,
 * and the RLS-scoped Supabase reads, then hands the raw signals here. Keeping the
 * "new vs returning" decision and the onboarding checklist as pure functions
 * means they are unit-testable in isolation and never error on undeployed tables
 * (the page passes safe defaults when a read fails).
 *
 * "First-run = guided checklist, not zeros" (§18 ✨): a member counts as NEW
 * until they have both finished onboarding (profile saved) AND logged at least
 * one trade. Everyone else gets the full returning-member dashboard.
 */

/** Minimal profile signal the dashboard needs (subset of the `profiles` row). */
export interface DashboardProfile {
  readonly onboardedAt: string | null;
  readonly accountSize: string | null;
}

/** Raw signals gathered server-side, passed to the pure derivation. */
export interface DashboardSignals {
  /** The profile row, or null when missing / table undeployed. */
  readonly profile: DashboardProfile | null;
  /** Count of the caller's trades (0 when none / table undeployed). */
  readonly tradeCount: number;
}

export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly done: boolean;
  /** Where the "Start" affordance points (in-app modules built so far). */
  readonly href: string;
  /** Module not yet built — the step is informational, no live link. */
  readonly pending?: boolean;
}

export interface DashboardModel {
  /** True for first-run members (no completed onboarding or no trades yet). */
  readonly isNewUser: boolean;
  /** True once onboarding has been completed (profile saved). */
  readonly onboarded: boolean;
  /** True once an account size has been set on the profile. */
  readonly hasAccountSize: boolean;
  /** Whether the caller has logged at least one trade. */
  readonly hasTrades: boolean;
  readonly checklist: ReadonlyArray<ChecklistItem>;
  /** Count of completed checklist steps. */
  readonly checklistDone: number;
  /** Whole-percent completion (0–100) for the progress bar. */
  readonly checklistPercent: number;
}

/**
 * Build the dashboard view-model from the gathered signals.
 *
 * The checklist mirrors §18's onboarding flow. Steps whose target module is not
 * built yet are marked `pending` (informational, no broken link); the steps we
 * can actually verify (profile, account size, first trade) flip to `done` from
 * the real signals.
 */
export function deriveDashboard(signals: DashboardSignals): DashboardModel {
  const onboarded = !!signals.profile?.onboardedAt;
  const hasAccountSize = !!signals.profile?.accountSize;
  const hasTrades = signals.tradeCount > 0;

  const checklist: ReadonlyArray<ChecklistItem> = [
    {
      id: 'profile',
      label: 'Complete your trading profile',
      done: onboarded,
      href: '/onboarding',
    },
    {
      id: 'account-size',
      label: 'Set your account size',
      done: hasAccountSize,
      href: '/onboarding',
    },
    {
      id: 'entry-course',
      label: 'Start the Entry course',
      done: false,
      href: '/curriculum',
      pending: true,
    },
    {
      id: 'walkthrough',
      label: 'Watch the platform walkthrough',
      done: false,
      href: '/curriculum',
      pending: true,
    },
    {
      id: 'first-trade',
      label: 'Log your first trade',
      done: hasTrades,
      href: '/journal/new',
    },
    {
      id: 'webinar',
      label: 'Register for the weekly webinar',
      done: false,
      href: '/webinars',
      pending: true,
    },
    {
      id: 'pod',
      label: 'Join a community pod',
      done: false,
      href: '/community',
      pending: true,
    },
  ];

  const checklistDone = checklist.reduce((n, item) => (item.done ? n + 1 : n), 0);
  const checklistPercent = Math.round((checklistDone / checklist.length) * 100);

  // A member is "new" until they have BOTH onboarded AND logged a trade — the
  // first-run experience persists through the guided checklist, not just the
  // very first second after signup.
  const isNewUser = !(onboarded && hasTrades);

  return {
    isNewUser,
    onboarded,
    hasAccountSize,
    hasTrades,
    checklist,
    checklistDone,
    checklistPercent,
  };
}

/** A friendly first-name-ish greeting from the user's name or email. */
export function greetingName(fullName: string | null | undefined, email: string | null | undefined): string {
  const name = (fullName ?? '').trim();
  if (name) {
    const first = name.split(/\s+/)[0];
    if (first) return first;
  }
  const local = (email ?? '').split('@')[0]?.trim();
  if (local) {
    // Title-case a simple local part (e.g. "alex.rivera" → "Alex").
    const head = local.split(/[._-]+/)[0] ?? local;
    return head.charAt(0).toUpperCase() + head.slice(1);
  }
  return 'trader';
}

/** Time-of-day greeting prefix. `hour` is injectable for deterministic tests. */
export function timeGreeting(hour: number = new Date().getHours()): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
