/**
 * Schema barrel — re-exports the full FX Academy data model.
 *
 * Domain split (each file <400 lines, organised by feature):
 *  - enums      shared Postgres enums
 *  - auth       users, profiles, organizations, memberships (tenant root)
 *  - billing    plans, subscriptions, entitlements
 *  - learning   courses, modules, lessons, lesson_assets, progress,
 *               quizzes, quiz_attempts, certificates
 *  - webinars   webinars, webinar_registrations, webinar_recordings
 *  - ai         ai_conversations, ai_messages, course_chunks (pgvector)
 *  - journal    trades, trade_attachments, analytics_snapshots
 *  - strategies strategies, trade_ideas, market_quotes, news_items
 *  - community  community_channels, community_posts, community_comments,
 *               reactions, reports, pods, pod_members
 *  - engagement notifications, notification_preferences
 *  - affiliates affiliates, referrals, commissions, payouts
 *  - ops        audit_logs, feature_flags, idempotency_keys, event_outbox
 *
 * Drizzle reads this barrel (see drizzle.config.ts) to generate migrations.
 * `_shared` (column helpers + the pgvector `vector` type) is exported too so
 * downstream packages can reuse the building blocks.
 */
export * from "./_shared.js";
export * from "./enums.js";
export * from "./auth.js";
export * from "./billing.js";
export * from "./learning.js";
export * from "./webinars.js";
export * from "./ai.js";
export * from "./journal.js";
export * from "./strategies.js";
export * from "./community.js";
export * from "./engagement.js";
export * from "./affiliates.js";
export * from "./ops.js";
