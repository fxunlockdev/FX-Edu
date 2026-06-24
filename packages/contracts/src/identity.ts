import { z } from 'zod';
import {
  DecisionSchema,
  FeatureKeySchema,
  IdSchema,
  IsoTimestampSchema,
  PlanSchema,
  SubscriptionStatusSchema,
} from './common.js';

/**
 * Identity domain — `GET /me` and `GET /entitlements`.
 *
 * `/me` returns the authenticated user, their active org, plan, and profile.
 * `/entitlements` returns the resolved feature → decision map the client uses
 * for UI lock hints (the server still re-checks on every gated call).
 */

/** A user's role within their active organization. */
export const RoleSchema = z.enum([
  'member',
  'educator',
  'admin',
  'affiliate',
  'partner_owner',
  'partner_admin',
  'support',
]);
export type Role = z.infer<typeof RoleSchema>;

/** The active tenant context. */
export const ActiveOrgSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  /** Whether this is the global FX Academy org or a white-label partner. */
  type: z.enum(['system', 'partner']),
});
export type ActiveOrg = z.infer<typeof ActiveOrgSchema>;

/** Member-facing profile fields (PRD §8.16 Settings). */
export const ProfileSchema = z.object({
  displayName: z.string().min(1).max(80),
  avatarUrl: z.string().url().nullable(),
  bio: z.string().max(500).nullable(),
  country: z.string().length(2).nullable(),
  riskProfile: z.enum(['conservative', 'balanced', 'aggressive']).nullable(),
  defaultSession: z.enum(['sydney', 'tokyo', 'london', 'new_york']).nullable(),
  onboardingComplete: z.boolean(),
});
export type Profile = z.infer<typeof ProfileSchema>;

/** Response payload for `GET /me`. */
export const MeResponseSchema = z.object({
  user: z.object({
    id: IdSchema,
    email: z.string().email(),
    fullName: z.string().min(1),
    status: z.enum(['active', 'suspended', 'pending_deletion']),
    ageConfirmed: z.boolean(),
    createdAt: IsoTimestampSchema,
  }),
  activeOrg: ActiveOrgSchema,
  roles: z.array(RoleSchema).min(1),
  plan: PlanSchema,
  subscriptionStatus: SubscriptionStatusSchema,
  profile: ProfileSchema,
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

/** One feature's resolved decision plus the reason, for UI hinting. */
export const EntitlementEntrySchema = z.object({
  featureKey: FeatureKeySchema,
  decision: DecisionSchema,
});
export type EntitlementEntry = z.infer<typeof EntitlementEntrySchema>;

/** Response payload for `GET /entitlements`. */
export const EntitlementsResponseSchema = z.object({
  plan: PlanSchema,
  subscriptionStatus: SubscriptionStatusSchema,
  /** Feature key → decision map (the canonical lock-hint surface). */
  features: z.record(FeatureKeySchema, DecisionSchema),
  /** When the server computed this map; clients may cache until TTL. */
  computedAt: IsoTimestampSchema,
});
export type EntitlementsResponse = z.infer<typeof EntitlementsResponseSchema>;
