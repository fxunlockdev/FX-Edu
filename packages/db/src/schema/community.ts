/**
 * Community domain: community_channels, community_posts, community_comments,
 * reactions, reports, pods, pod_members.
 *
 * Pro-only and tenant-scoped (Basic cannot read via direct URL — enforced by
 * RLS + entitlement). Posts and comments carry a `deleted_at` soft-delete so
 * moderation actions retain the audit trail (PROJECT.md §10, PRD §8.11).
 */
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns, softDelete } from "./_shared";
import {
  accessLevelEnum,
  moderationStatusEnum,
  podMemberRoleEnum,
  reactionTargetTypeEnum,
  reportStatusEnum,
  reportTargetTypeEnum,
} from "./enums";
import { organizations, users } from "./auth";

/* ── community_channels ────────────────────────────────────────────── */

export const communityChannels = pgTable(
  "community_channels",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    description: text("description"),
    accessLevel: accessLevelEnum("access_level").notNull().default("pro"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    uniqueIndex("community_channels_org_slug_uq").on(table.orgId, table.slug),
    index("community_channels_org_idx").on(table.orgId),
  ],
);

/* ── community_posts (soft-deletable) ──────────────────────────────── */

export const communityPosts = pgTable(
  "community_posts",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    channelId: uuid("channel_id")
      .notNull()
      .references(() => communityChannels.id, { onDelete: "cascade" }),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    /** Optional chart/image upload (Storage key, scanned before serve). */
    attachmentStorageKey: text("attachment_storage_key"),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("visible"),
    ...softDelete,
  },
  (table) => [
    index("community_posts_channel_idx").on(table.channelId),
    index("community_posts_org_idx").on(table.orgId),
    index("community_posts_author_idx").on(table.authorUserId),
  ],
);

/* ── community_comments (soft-deletable) ───────────────────────────── */

export const communityComments = pgTable(
  "community_comments",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("visible"),
    ...softDelete,
  },
  (table) => [
    index("community_comments_post_idx").on(table.postId),
    index("community_comments_org_idx").on(table.orgId),
  ],
);

/* ── reactions ─────────────────────────────────────────────────────── */

export const reactions = pgTable(
  "reactions",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: reactionTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    /** e.g. `like`, `insightful`, `celebrate`. */
    type: varchar("type", { length: 40 }).notNull(),
  },
  (table) => [
    uniqueIndex("reactions_user_target_type_uq").on(
      table.userId,
      table.targetType,
      table.targetId,
      table.type,
    ),
    index("reactions_target_idx").on(table.targetType, table.targetId),
    index("reactions_org_idx").on(table.orgId),
  ],
);

/* ── reports (moderation queue) ────────────────────────────────────── */

export const reports = pgTable(
  "reports",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    reporterUserId: uuid("reporter_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: reportTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    reason: varchar("reason", { length: 200 }).notNull(),
    notes: text("notes"),
    status: reportStatusEnum("status").notNull().default("open"),
    /** Moderator resolution metadata (action, actor, reason note). */
    resolution: jsonb("resolution").notNull().default({}),
  },
  (table) => [
    index("reports_org_idx").on(table.orgId),
    index("reports_status_idx").on(table.status),
    index("reports_target_idx").on(table.targetType, table.targetId),
  ],
);

/* ── pods ──────────────────────────────────────────────────────────── */

export const pods = pgTable(
  "pods",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    /** Capacity (accountability pods are 6–10). */
    capacity: integer("capacity").notNull().default(10),
    /** Weekly goal/check-in rules. */
    rules: jsonb("rules").notNull().default({}),
  },
  (table) => [index("pods_org_idx").on(table.orgId)],
);

/* ── pod_members ───────────────────────────────────────────────────── */

export const podMembers = pgTable(
  "pod_members",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    podId: uuid("pod_id")
      .notNull()
      .references(() => pods.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: podMemberRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("pod_members_pod_user_uq").on(table.podId, table.userId),
    index("pod_members_org_idx").on(table.orgId),
    index("pod_members_user_idx").on(table.userId),
  ],
);

/* ── relations ─────────────────────────────────────────────────────── */

export const communityChannelsRelations = relations(
  communityChannels,
  ({ many }) => ({
    posts: many(communityPosts),
  }),
);

export const communityPostsRelations = relations(
  communityPosts,
  ({ one, many }) => ({
    channel: one(communityChannels, {
      fields: [communityPosts.channelId],
      references: [communityChannels.id],
    }),
    comments: many(communityComments),
  }),
);

export const podsRelations = relations(pods, ({ many }) => ({
  members: many(podMembers),
}));

/* ── validation contracts ──────────────────────────────────────────── */

export const insertCommunityChannelSchema =
  createInsertSchema(communityChannels);
export const selectCommunityChannelSchema =
  createSelectSchema(communityChannels);

export const insertCommunityPostSchema = createInsertSchema(communityPosts);
export const selectCommunityPostSchema = createSelectSchema(communityPosts);

export const insertCommunityCommentSchema =
  createInsertSchema(communityComments);
export const selectCommunityCommentSchema =
  createSelectSchema(communityComments);

export const insertReactionSchema = createInsertSchema(reactions);
export const selectReactionSchema = createSelectSchema(reactions);

export const insertReportSchema = createInsertSchema(reports);
export const selectReportSchema = createSelectSchema(reports);

export const insertPodSchema = createInsertSchema(pods);
export const selectPodSchema = createSelectSchema(pods);

export const insertPodMemberSchema = createInsertSchema(podMembers);
export const selectPodMemberSchema = createSelectSchema(podMembers);
