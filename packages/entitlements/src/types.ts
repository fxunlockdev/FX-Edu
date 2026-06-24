/**
 * Core entitlement domain types.
 *
 * All types are plain data; the entitlements package is pure decision logic
 * with no I/O. Source of truth for what these encode: PRD §5 (Plans And
 * Entitlements) and PROJECT.md §6.2 (Entitlement enforcement).
 */

/** Subscription plans offered by FX Academy. */
export type Plan = 'basic' | 'pro' | 'elite';

/**
 * Subscription lifecycle status, mirrored from Stripe webhooks into our DB.
 * Only `active` and `trialing` grant access to gated features.
 *
 * - `active`     — paid and current.
 * - `trialing`   — in trial window; treated as active for access.
 * - `past_due`   — payment failed, in dunning/grace; gated access denied.
 * - `canceled`   — ended; access removed (data preserved — see downgrade).
 * - `incomplete` — checkout not finished / first payment unconfirmed.
 * - `unpaid`     — dunning exhausted; access removed.
 * - `paused`     — subscription paused; gated access denied.
 */
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'unpaid'
  | 'paused';

/**
 * Course curriculum tiers (PRD §8.4). Ordered from foundational to advanced;
 * `psychology` is cross-cutting and Pro-gated.
 */
export type CourseTier =
  | 'entry'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'psychology';

/**
 * Every gateable product capability. Course tiers are represented both as
 * `courses` (the surface) and as the per-tier keys so a single matrix can
 * answer "can this plan reach Intermediate courses?".
 */
export type FeatureKey =
  // Course surface + per-tier access.
  | 'courses'
  | 'tier_entry'
  | 'tier_beginner'
  | 'tier_intermediate'
  | 'tier_advanced'
  | 'tier_psychology'
  // Pro+ product surfaces.
  | 'webinars'
  | 'ai_tutor'
  | 'analytics'
  | 'community'
  | 'trade_ideas'
  | 'prop_firm'
  | 'strategy_library'
  // Foundational tools available to all paid plans.
  | 'certificates'
  | 'journal'
  | 'risk_calculator';

/**
 * Per-viewer media token lifecycle state, checked when minting a signed
 * playback token (PROJECT.md §6.4). An expired/revoked token must be denied
 * even if the plan is otherwise entitled.
 */
export type MediaTokenState = 'none' | 'valid' | 'expired' | 'revoked';

/**
 * Per-webinar access grant. A user may be entitled by plan yet still need a
 * registration record; a registered free webinar is reachable without Pro.
 */
export type WebinarAccess = 'none' | 'registered' | 'free_public';

/**
 * The full context a server-side authorization check supplies to the pure
 * decision functions. Everything here is already-resolved fact (the API reads
 * it from the verified JWT, the subscription row, and the request), so the
 * decision is deterministic.
 */
export interface EntitlementContext {
  /** The user's current plan. */
  readonly plan: Plan;
  /** Subscription status mirrored from Stripe. */
  readonly subscriptionStatus: SubscriptionStatus;
  /** Active tenant (org) id — present for tenant-scoped checks. */
  readonly orgId?: string;
  /** Course tier being accessed (required for tier checks). */
  readonly tier?: CourseTier;
  /** The feature being accessed. */
  readonly featureKey: FeatureKey;
  /** Per-webinar access grant, when relevant. */
  readonly webinarAccess?: WebinarAccess;
  /** Media token lifecycle state, when minting/validating playback. */
  readonly mediaTokenState?: MediaTokenState;
}

/**
 * A decision outcome.
 *
 * - `allow`  — access granted.
 * - `deny`   — access refused outright (no plan path, or hard block such as an
 *              expired media token / inactive subscription).
 * - `locked` — the feature exists for a higher plan; the UI should render a
 *              designed locked state with an upgrade path (PROJECT.md §7.3).
 *
 * `locked` vs `deny` is semantically important: `locked` means "upgrade to
 * unlock", `deny` means "you cannot have this right now" (e.g. lapsed payment).
 */
export type Decision = 'allow' | 'deny' | 'locked';

/** Immutable map of every feature to its resolved decision for a plan/status. */
export type EntitlementMap = Readonly<Record<FeatureKey, Decision>>;
