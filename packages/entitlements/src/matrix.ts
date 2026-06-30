import type { CourseTier, FeatureKey, Plan } from './types';

/**
 * The plan → feature entitlement matrix, encoded verbatim from PRD §5.
 *
 * `true`  = the plan includes this feature when the subscription is active.
 * `false` = the plan does NOT include it (a higher plan does → renders locked).
 *
 * Source of truth (PRD §5):
 *  - Basic  → Entry + Beginner courses, journal, risk calculator, certificates
 *             for Basic-access tiers. Everything else locked.
 *  - Pro    → full 5-tier curriculum incl. Psychology, webinars, AI tutor,
 *             analytics, community, trade ideas, prop firm, strategy library,
 *             journal, risk calculator, certificates at every tier.
 *  - Elite  → everything in Pro, plus the Elite extras (modeled as the same
 *             feature keys — Elite is a strict superset of Pro at this layer;
 *             Elite-only surfaces like coaching are separate higher-tier keys
 *             handled in their own module, PROJECT.md §9 module 21).
 */
export const PLAN_FEATURES: Readonly<Record<Plan, Readonly<Record<FeatureKey, boolean>>>> =
  Object.freeze({
    basic: Object.freeze({
      // Courses: Basic reaches the course surface but only Entry + Beginner.
      courses: true,
      tier_entry: true,
      tier_beginner: true,
      tier_intermediate: false,
      tier_advanced: false,
      tier_psychology: false,
      // Pro+ surfaces — all locked for Basic.
      webinars: false,
      ai_tutor: false,
      analytics: false,
      community: false,
      trade_ideas: false,
      prop_firm: false,
      strategy_library: false,
      // Foundational tools — included for Basic.
      certificates: true,
      journal: true,
      risk_calculator: true,
    }),
    pro: Object.freeze({
      courses: true,
      tier_entry: true,
      tier_beginner: true,
      tier_intermediate: true,
      tier_advanced: true,
      tier_psychology: true,
      webinars: true,
      ai_tutor: true,
      analytics: true,
      community: true,
      trade_ideas: true,
      prop_firm: true,
      strategy_library: true,
      certificates: true,
      journal: true,
      risk_calculator: true,
    }),
    elite: Object.freeze({
      // Elite is a superset of Pro at the feature-key layer.
      courses: true,
      tier_entry: true,
      tier_beginner: true,
      tier_intermediate: true,
      tier_advanced: true,
      tier_psychology: true,
      webinars: true,
      ai_tutor: true,
      analytics: true,
      community: true,
      trade_ideas: true,
      prop_firm: true,
      strategy_library: true,
      certificates: true,
      journal: true,
      risk_calculator: true,
    }),
  });

/** Stable list of every feature key — the canonical iteration order. */
export const ALL_FEATURE_KEYS: readonly FeatureKey[] = Object.freeze([
  'courses',
  'tier_entry',
  'tier_beginner',
  'tier_intermediate',
  'tier_advanced',
  'tier_psychology',
  'webinars',
  'ai_tutor',
  'analytics',
  'community',
  'trade_ideas',
  'prop_firm',
  'strategy_library',
  'certificates',
  'journal',
  'risk_calculator',
]);

/** Maps a course tier to the feature key that gates it. */
export const TIER_FEATURE_KEY: Readonly<Record<CourseTier, FeatureKey>> = Object.freeze({
  entry: 'tier_entry',
  beginner: 'tier_beginner',
  intermediate: 'tier_intermediate',
  advanced: 'tier_advanced',
  psychology: 'tier_psychology',
});

/**
 * Features that survive a downgrade as *data access* even though their gated
 * Pro views lock. Per PRD §5 / §8.8 and PROJECT.md §6.2: "Downgrades preserve
 * data (journal, certificates, progress) but flip gated views to locked."
 *
 * A downgraded (Basic) user keeps read access to their journal, their earned
 * certificates, and their course progress — the Pro analytics *view* over that
 * data is what locks, not the underlying journal entries.
 */
export const DATA_PRESERVING_FEATURES: readonly FeatureKey[] = Object.freeze([
  'journal',
  'risk_calculator',
  'certificates',
]);
