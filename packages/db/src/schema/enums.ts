/**
 * Postgres enums shared across domains.
 *
 * Centralised so a value (e.g. `plan_tier`) is declared once and reused by both
 * the table that owns it and any table that references it. Drizzle emits these
 * as native `CREATE TYPE ... AS ENUM` in the generated migration.
 */
import { pgEnum } from "drizzle-orm/pg-core";

/* ── Identity & access ─────────────────────────────────────────────── */

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "pending", // signed up, email not yet verified
  "suspended",
  "banned",
  "deleted", // pseudonymised; row retained for audit integrity
]);

/** Tenant type. The global FX Academy data lives under a `system` org. */
export const orgTypeEnum = pgEnum("org_type", ["system", "partner"]);

export const orgStatusEnum = pgEnum("org_status", [
  "active",
  "onboarding",
  "suspended",
  "archived",
]);

/** Role within an org membership (RLS reads this via the JWT `role` claim). */
export const membershipRoleEnum = pgEnum("membership_role", [
  "member",
  "educator",
  "affiliate",
  "support",
  "admin",
  "owner",
]);

export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "invited",
  "suspended",
  "removed",
]);

/* ── Billing & entitlements ────────────────────────────────────────── */

export const planTierEnum = pgEnum("plan_tier", [
  "basic",
  "pro",
  "elite",
  "partner_license",
]);

export const billingIntervalEnum = pgEnum("billing_interval", [
  "monthly",
  "yearly",
]);

/** Mirrors Stripe subscription statuses (webhook is source of truth). */
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
]);

/** Where an entitlement came from — drives reconciliation precedence. */
export const entitlementSourceEnum = pgEnum("entitlement_source", [
  "subscription",
  "partner_license",
  "manual_grant",
  "trial",
]);

/* ── Learning ──────────────────────────────────────────────────────── */

/** The five curriculum tiers (PRD §8.4). */
export const courseTierEnum = pgEnum("course_tier", [
  "entry",
  "beginner",
  "intermediate",
  "advanced",
  "psychology",
]);

/** Minimum plan required to access a piece of content. */
export const accessLevelEnum = pgEnum("access_level", [
  "free",
  "basic",
  "pro",
  "elite",
  "partner",
]);

export const publishStatusEnum = pgEnum("publish_status", [
  "draft",
  "published",
  "archived",
]);

export const lessonAssetKindEnum = pgEnum("lesson_asset_kind", [
  "video",
  "caption",
  "thumbnail",
  "transcript",
  "notes",
  "attachment",
]);

export const quizAttemptResultEnum = pgEnum("quiz_attempt_result", [
  "passed",
  "failed",
]);

/* ── Webinars ──────────────────────────────────────────────────────── */

export const webinarStatusEnum = pgEnum("webinar_status", [
  "scheduled",
  "live",
  "ended",
  "canceled",
]);

export const webinarRegistrationStatusEnum = pgEnum(
  "webinar_registration_status",
  ["registered", "attended", "no_show", "canceled"],
);

export const recordingStatusEnum = pgEnum("recording_status", [
  "pending",
  "processing",
  "ready",
  "failed",
]);

/* ── AI tutor ──────────────────────────────────────────────────────── */

export const aiModeEnum = pgEnum("ai_mode", [
  "explain",
  "quiz",
  "whats_next",
  "review_trade",
]);

export const aiConversationStatusEnum = pgEnum("ai_conversation_status", [
  "open",
  "closed",
  "flagged", // routed to admin human-review queue
  "deleted",
]);

export const aiMessageRoleEnum = pgEnum("ai_message_role", [
  "user",
  "assistant",
  "system",
]);

/** Source corpus a retrieval chunk belongs to (citations + re-index scope). */
export const chunkSourceTypeEnum = pgEnum("chunk_source_type", [
  "lesson",
  "glossary",
  "policy",
  "strategy",
  "example",
]);

/* ── Journal & trading ─────────────────────────────────────────────── */

export const tradeDirectionEnum = pgEnum("trade_direction", ["long", "short"]);

export const tradeResultEnum = pgEnum("trade_result", [
  "open",
  "win",
  "loss",
  "breakeven",
]);

/** FX trading sessions (used by journal + analytics breakdowns). */
export const tradingSessionEnum = pgEnum("trading_session", [
  "sydney",
  "tokyo",
  "london",
  "new_york",
]);

export const tradeStatusEnum = pgEnum("trade_status", ["draft", "logged"]);

/* ── Strategies & ideas ────────────────────────────────────────────── */

export const strategyCategoryEnum = pgEnum("strategy_category", [
  "technical",
  "smart_money",
  "trend",
  "range",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const tradeBiasEnum = pgEnum("trade_bias", ["long", "short", "neutral"]);

export const newsImpactEnum = pgEnum("news_impact", ["high", "medium", "low"]);

/* ── Community ─────────────────────────────────────────────────────── */

/** Lifecycle for moderated content (posts/comments). */
export const moderationStatusEnum = pgEnum("moderation_status", [
  "visible",
  "held", // auto-held for review (e.g. signal-like solicitation)
  "hidden", // moderator hid it
  "removed", // soft-deleted by moderator
]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewing",
  "actioned",
  "dismissed",
]);

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "post",
  "comment",
  "user",
]);

export const reactionTargetTypeEnum = pgEnum("reaction_target_type", [
  "post",
  "comment",
]);

export const podMemberRoleEnum = pgEnum("pod_member_role", [
  "member",
  "lead",
]);

/* ── Engagement / notifications ────────────────────────────────────── */

export const notificationChannelEnum = pgEnum("notification_channel", [
  "in_app",
  "email",
  "push",
]);

/** Notification + lifecycle-event taxonomy (PRD §6 notification types). */
export const notificationTypeEnum = pgEnum("notification_type", [
  "webinar_reminder",
  "new_trade_idea",
  "community_reply",
  "post_reaction",
  "weekly_digest",
  "product_update",
  "certificate_earned",
  "certificate_progress",
  "failed_payment",
  "affiliate_payout",
  "partner_domain_verification",
]);

/* ── Affiliates ────────────────────────────────────────────────────── */

export const affiliateStatusEnum = pgEnum("affiliate_status", [
  "pending", // application submitted
  "approved",
  "rejected",
  "suspended",
]);

export const referralConversionStateEnum = pgEnum("referral_conversion_state", [
  "visited",
  "signed_up",
  "trialing",
  "paid",
  "churned",
]);

export const commissionStatusEnum = pgEnum("commission_status", [
  "pending",
  "approved",
  "paid",
  "reversed", // refund / chargeback adjustment
]);

export const payoutStatusEnum = pgEnum("payout_status", [
  "pending",
  "in_transit",
  "paid",
  "failed",
]);

/* ── Ops ───────────────────────────────────────────────────────────── */

/** Delivery state for the transactional outbox (event_outbox). */
export const outboxStatusEnum = pgEnum("outbox_status", [
  "pending",
  "processing",
  "published",
  "failed",
  "dead_letter",
]);

export const featureFlagStatusEnum = pgEnum("feature_flag_status", [
  "on",
  "off",
  "rollout",
]);
