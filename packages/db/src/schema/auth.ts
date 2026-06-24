/**
 * Identity & access domain: users, profiles, organizations, memberships.
 *
 * Multi-tenancy lives here. `organizations` is the tenant root; the global FX
 * Academy data sits under a single `system` org. Every tenant-scoped table in
 * other domains references `organizations.id` via `org_id` and is protected by
 * RLS (see `src/policies/`).
 *
 * `users` mirrors the Supabase Auth user (auth PII stays inside our EU
 * Postgres). The `auth_user_id` is the Supabase `auth.users.id` (the JWT `sub`).
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns, primaryKey, timestamps } from "./_shared.js";
import {
  membershipRoleEnum,
  membershipStatusEnum,
  orgStatusEnum,
  orgTypeEnum,
  tradingSessionEnum,
  userStatusEnum,
} from "./enums.js";

/* ── organizations (tenant root) ───────────────────────────────────── */

export const organizations = pgTable(
  "organizations",
  {
    ...baseColumns,
    type: orgTypeEnum("type").notNull().default("partner"),
    status: orgStatusEnum("status").notNull().default("onboarding"),
    name: varchar("name", { length: 200 }).notNull(),
    /** URL-safe identifier; the system org uses a reserved slug. */
    slug: varchar("slug", { length: 120 }).notNull(),
    /** Owning user; nullable for the system org. */
    ownerUserId: uuid("owner_user_id"),
    /** Branding config: logo, favicon, colors, theme, legal copy. */
    branding: jsonb("branding").notNull().default({}),
    /** Custom-domain config: domain, dns state, ownership-verify, ssl state. */
    domainConfig: jsonb("domain_config").notNull().default({}),
    /** Whether the partner's custom domain ownership is verified. */
    domainVerified: boolean("domain_verified").notNull().default(false),
  },
  (table) => [
    uniqueIndex("organizations_slug_uq").on(table.slug),
    index("organizations_owner_idx").on(table.ownerUserId),
    index("organizations_type_idx").on(table.type),
  ],
);

/* ── users (mirror of Supabase Auth) ───────────────────────────────── */

export const users = pgTable(
  "users",
  {
    ...baseColumns,
    /** Supabase Auth user id (= JWT `sub`). One-to-one. */
    authUserId: uuid("auth_user_id").notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    fullName: varchar("full_name", { length: 200 }),
    status: userStatusEnum("status").notNull().default("pending"),
    country: varchar("country", { length: 2 }),
    /** 18+/jurisdictional age-gate acknowledgement at signup (PROJECT.md §6.7). */
    ageConfirmedAt: timestamp("age_confirmed_at", { withTimezone: true }),
    /** Terms + risk-disclosure acknowledgement timestamp. */
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_auth_user_id_uq").on(table.authUserId),
    uniqueIndex("users_email_uq").on(table.email),
    index("users_status_idx").on(table.status),
  ],
);

/* ── profiles (1:1 with users) ─────────────────────────────────────── */

export const profiles = pgTable(
  "profiles",
  {
    ...primaryKey,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 120 }),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    /** Self-reported risk profile from onboarding / settings. */
    riskProfile: varchar("risk_profile", { length: 40 }),
    defaultSession: tradingSessionEnum("default_session"),
    /** Recoverable onboarding state (step, answers) — survives browser close. */
    onboardingState: jsonb("onboarding_state").notNull().default({}),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),
    ...timestamps,
  },
  (table) => [uniqueIndex("profiles_user_id_uq").on(table.userId)],
);

/* ── memberships (user ↔ org ↔ roles) ──────────────────────────────── */

export const memberships = pgTable(
  "memberships",
  {
    ...primaryKey,
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: membershipRoleEnum("role").notNull().default("member"),
    status: membershipStatusEnum("status").notNull().default("active"),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    // A user has at most one membership row per org+role.
    uniqueIndex("memberships_user_org_role_uq").on(
      table.userId,
      table.orgId,
      table.role,
    ),
    index("memberships_org_idx").on(table.orgId),
    index("memberships_user_idx").on(table.userId),
  ],
);

/* ── relations ─────────────────────────────────────────────────────── */

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  memberships: many(memberships),
}));

export const organizationsRelations = relations(
  organizations,
  ({ many }) => ({
    memberships: many(memberships),
  }),
);

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [memberships.orgId],
    references: [organizations.id],
  }),
}));

/* ── validation contracts (drizzle-zod) ────────────────────────────── */

export const insertOrganizationSchema = createInsertSchema(organizations);
export const selectOrganizationSchema = createSelectSchema(organizations);

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);

export const insertMembershipSchema = createInsertSchema(memberships);
export const selectMembershipSchema = createSelectSchema(memberships);
