/**
 * Affiliates domain: affiliates, referrals, commissions, payouts.
 *
 * Tenant-scoped. Attribution is server-side and tamper-resistant (PROJECT.md
 * §6.x / PRD §8.18); self-referral is blocked unless explicitly allowed.
 * Payouts via Stripe Connect are blocked until KYC + disclosure are complete.
 * Money amounts are stored in minor units (cents) as integers.
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
  affiliateStatusEnum,
  commissionStatusEnum,
  payoutStatusEnum,
  planTierEnum,
  referralConversionStateEnum,
} from "./enums";
import { organizations, users } from "./auth";
import { subscriptions } from "./billing";

/* ── affiliates ────────────────────────────────────────────────────── */

export const affiliates = pgTable(
  "affiliates",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Unique referral code. */
    code: varchar("code", { length: 64 }).notNull(),
    status: affiliateStatusEnum("status").notNull().default("pending"),
    /** Commission config: { basicPct, proPct, cookieDays } overrides. */
    commissionConfig: jsonb("commission_config").notNull().default({}),
    /** Stripe Connect account id (payouts blocked until onboarded). */
    stripeConnectAccountId: varchar("stripe_connect_account_id", {
      length: 255,
    }),
    /** KYC + disclosure gates — both required before any payout. */
    kycCompletedAt: timestamp("kyc_completed_at", { withTimezone: true }),
    disclosureAcceptedAt: timestamp("disclosure_accepted_at", {
      withTimezone: true,
    }),
    /** Whether self-referral is explicitly permitted for this affiliate. */
    allowSelfReferral: boolean("allow_self_referral")
      .notNull()
      .default(false),
  },
  (table) => [
    uniqueIndex("affiliates_code_uq").on(table.code),
    uniqueIndex("affiliates_user_org_uq").on(table.userId, table.orgId),
    index("affiliates_org_idx").on(table.orgId),
    index("affiliates_status_idx").on(table.status),
  ],
);

/* ── referrals (attribution) ───────────────────────────────────────── */

export const referrals = pgTable(
  "referrals",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    affiliateId: uuid("affiliate_id")
      .notNull()
      .references(() => affiliates.id, { onDelete: "cascade" }),
    /** Anonymous visitor identifier captured server-side at click time. */
    visitorId: varchar("visitor_id", { length: 128 }).notNull(),
    /** Converted user, once the visitor signs up. */
    referredUserId: uuid("referred_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    campaign: varchar("campaign", { length: 120 }),
    /** Attribution source / UTM blob (last-touch attribution). */
    attribution: jsonb("attribution").notNull().default({}),
    conversionState: referralConversionStateEnum("conversion_state")
      .notNull()
      .default("visited"),
    /** Cookie/attribution expiry (e.g. 60-day window). */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    index("referrals_affiliate_idx").on(table.affiliateId),
    index("referrals_visitor_idx").on(table.visitorId),
    index("referrals_org_idx").on(table.orgId),
    index("referrals_referred_user_idx").on(table.referredUserId),
  ],
);

/* ── commissions ───────────────────────────────────────────────────── */

export const commissions = pgTable(
  "commissions",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    affiliateId: uuid("affiliate_id")
      .notNull()
      .references(() => affiliates.id, { onDelete: "cascade" }),
    referralId: uuid("referral_id")
      .notNull()
      .references(() => referrals.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").references(
      () => subscriptions.id,
      { onDelete: "set null" },
    ),
    planTier: planTierEnum("plan_tier"),
    /** Commission amount in minor units (cents). */
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    status: commissionStatusEnum("status").notNull().default("pending"),
    payoutId: uuid("payout_id"),
  },
  (table) => [
    index("commissions_affiliate_idx").on(table.affiliateId),
    index("commissions_referral_idx").on(table.referralId),
    index("commissions_org_idx").on(table.orgId),
    index("commissions_status_idx").on(table.status),
  ],
);

/* ── payouts ───────────────────────────────────────────────────────── */

export const payouts = pgTable(
  "payouts",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    affiliateId: uuid("affiliate_id")
      .notNull()
      .references(() => affiliates.id, { onDelete: "cascade" }),
    /** Stripe Connect transfer/payout ids (idempotent). */
    stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
    stripePayoutId: varchar("stripe_payout_id", { length: 255 }),
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    status: payoutStatusEnum("status").notNull().default("pending"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("payouts_stripe_transfer_uq").on(table.stripeTransferId),
    index("payouts_affiliate_idx").on(table.affiliateId),
    index("payouts_org_idx").on(table.orgId),
    index("payouts_status_idx").on(table.status),
  ],
);

/* ── relations ─────────────────────────────────────────────────────── */

export const affiliatesRelations = relations(affiliates, ({ many, one }) => ({
  referrals: many(referrals),
  commissions: many(commissions),
  payouts: many(payouts),
  user: one(users, {
    fields: [affiliates.userId],
    references: [users.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one, many }) => ({
  affiliate: one(affiliates, {
    fields: [referrals.affiliateId],
    references: [affiliates.id],
  }),
  commissions: many(commissions),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [commissions.affiliateId],
    references: [affiliates.id],
  }),
  referral: one(referrals, {
    fields: [commissions.referralId],
    references: [referrals.id],
  }),
}));

/* ── validation contracts ──────────────────────────────────────────── */

export const insertAffiliateSchema = createInsertSchema(affiliates);
export const selectAffiliateSchema = createSelectSchema(affiliates);

export const insertReferralSchema = createInsertSchema(referrals);
export const selectReferralSchema = createSelectSchema(referrals);

export const insertCommissionSchema = createInsertSchema(commissions);
export const selectCommissionSchema = createSelectSchema(commissions);

export const insertPayoutSchema = createInsertSchema(payouts);
export const selectPayoutSchema = createSelectSchema(payouts);
