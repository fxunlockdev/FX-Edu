import { z } from 'zod';

/**
 * Shared primitive schemas reused across every domain. Keeping these in one
 * place keeps id/enum/timestamp shapes consistent and validated at every
 * boundary (ENGINEERING.md: validate with Zod, never trust external data).
 */

/** UUID identifier (Postgres `uuid`). */
export const IdSchema = z.string().uuid();
export type Id = z.infer<typeof IdSchema>;

/** ISO-8601 timestamp string. */
export const IsoTimestampSchema = z.string().datetime({ offset: true });
export type IsoTimestamp = z.infer<typeof IsoTimestampSchema>;

/** Subscription plans (mirrors @fxunlock/entitlements `Plan`). */
export const PlanSchema = z.enum(['basic', 'pro', 'elite']);
export type Plan = z.infer<typeof PlanSchema>;

/** Subscription status (mirrors @fxunlock/entitlements `SubscriptionStatus`). */
export const SubscriptionStatusSchema = z.enum([
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'unpaid',
  'paused',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;

/** Course curriculum tiers (PRD §8.4). */
export const CourseTierSchema = z.enum([
  'entry',
  'beginner',
  'intermediate',
  'advanced',
  'psychology',
]);
export type CourseTier = z.infer<typeof CourseTierSchema>;

/** A feature decision (mirrors @fxunlock/entitlements `Decision`). */
export const DecisionSchema = z.enum(['allow', 'deny', 'locked']);
export type Decision = z.infer<typeof DecisionSchema>;

/** Feature keys (mirrors @fxunlock/entitlements `FeatureKey`). */
export const FeatureKeySchema = z.enum([
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
export type FeatureKey = z.infer<typeof FeatureKeySchema>;

/** Access level used by courses, webinars, strategies, ideas, channels. */
export const AccessLevelSchema = z.enum(['free', 'basic', 'pro', 'elite', 'partner']);
export type AccessLevel = z.infer<typeof AccessLevelSchema>;

/** Currency ISO-4217 code (uppercase 3-letter). */
export const CurrencyCodeSchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, 'must be a 3-letter ISO currency code');
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

/** Trade direction. */
export const TradeDirectionSchema = z.enum(['long', 'short']);
export type TradeDirection = z.infer<typeof TradeDirectionSchema>;
