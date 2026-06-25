/**
 * Billing & entitlements domain: plans, subscriptions, entitlements.
 *
 * Stripe webhooks are the source of truth (PROJECT.md §6.2). Subscriptions and
 * entitlements are written idempotently from webhook handlers; a nightly
 * reconciliation job re-pulls Stripe to heal missed events.
 *
 * `plans` is a global/system table (no `org_id`). `subscriptions` and
 * `entitlements` are tenant-scoped — a member's subscription belongs to their
 * active org context, and partner licenses grant org-level entitlements.
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns } from "./_shared";
import {
  billingIntervalEnum,
  entitlementSourceEnum,
  planTierEnum,
  subscriptionStatusEnum,
} from "./enums";
import { organizations, users } from "./auth";

/* ── plans (global catalog, mirrors Stripe prices) ─────────────────── */

export const plans = pgTable(
  "plans",
  {
    ...baseColumns,
    tier: planTierEnum("tier").notNull(),
    interval: billingIntervalEnum("interval").notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    /** Price in minor units (cents) to avoid float drift. */
    priceCents: integer("price_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    /** Stripe Price id; the binding between our plan and Stripe billing. */
    stripePriceId: varchar("stripe_price_id", { length: 255 }),
    stripeProductId: varchar("stripe_product_id", { length: 255 }),
    /** Feature keys this plan grants (drives the entitlements package). */
    featureKeys: jsonb("feature_keys").notNull().default([]),
    active: boolean("active").notNull().default(true),
  },
  (table) => [
    uniqueIndex("plans_tier_interval_uq").on(table.tier, table.interval),
    uniqueIndex("plans_stripe_price_uq").on(table.stripePriceId),
  ],
);

/* ── subscriptions (Stripe-mirrored, tenant-scoped) ────────────────── */

export const subscriptions = pgTable(
  "subscriptions",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: uuid("plan_id").references(() => plans.id, {
      onDelete: "set null",
    }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
    stripeSubscriptionId: varchar("stripe_subscription_id", {
      length: 255,
    }).notNull(),
    status: subscriptionStatusEnum("status").notNull().default("incomplete"),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    /** Cancel-at-period-end flag; access is retained until period end. */
    cancelAtPeriodEnd: boolean("cancel_at_period_end")
      .notNull()
      .default(false),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("subscriptions_stripe_sub_uq").on(table.stripeSubscriptionId),
    index("subscriptions_org_idx").on(table.orgId),
    index("subscriptions_user_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
  ],
);

/* ── entitlements (derived, tenant-scoped) ─────────────────────────── */

export const entitlements = pgTable(
  "entitlements",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    /** Null user = an org-wide entitlement (partner license). */
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    /** e.g. `course.intermediate`, `webinars.live`, `ai.tutor`. */
    featureKey: varchar("feature_key", { length: 120 }).notNull(),
    source: entitlementSourceEnum("source").notNull(),
    /** The subscription/license that produced this entitlement (audit trail). */
    sourceRefId: uuid("source_ref_id"),
    active: boolean("active").notNull().default(true),
    startsAt: timestamp("starts_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
  },
  (table) => [
    // One active row per (org, user, feature). Reconciliation upserts on this.
    uniqueIndex("entitlements_scope_feature_uq").on(
      table.orgId,
      table.userId,
      table.featureKey,
    ),
    index("entitlements_org_idx").on(table.orgId),
    index("entitlements_user_idx").on(table.userId),
    index("entitlements_active_idx").on(table.active),
  ],
);

/* ── relations ─────────────────────────────────────────────────────── */

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
  organization: one(organizations, {
    fields: [subscriptions.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const entitlementsRelations = relations(entitlements, ({ one }) => ({
  organization: one(organizations, {
    fields: [entitlements.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [entitlements.userId],
    references: [users.id],
  }),
}));

/* ── validation contracts ──────────────────────────────────────────── */

export const insertPlanSchema = createInsertSchema(plans);
export const selectPlanSchema = createSelectSchema(plans);

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);

export const insertEntitlementSchema = createInsertSchema(entitlements);
export const selectEntitlementSchema = createSelectSchema(entitlements);
