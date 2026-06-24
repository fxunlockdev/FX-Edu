/**
 * AI tutor domain: ai_conversations, ai_messages, course_chunks.
 *
 * `course_chunks` is the pgvector retrieval index — approved course content
 * only (no open web). Each chunk carries source metadata so answers can cite
 * the originating lesson/glossary entry. Conversations + messages are
 * tenant-scoped and user-owned; logs are redacted + retention-limited and the
 * user can delete their history (PROJECT.md §6.5).
 */
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns, vector } from "./_shared.js";
import {
  aiConversationStatusEnum,
  aiMessageRoleEnum,
  aiModeEnum,
  chunkSourceTypeEnum,
} from "./enums.js";
import { lessons } from "./learning.js";
import { organizations, users } from "./auth.js";

/** Embedding dimension for the retrieval index (matches the embed model). */
export const EMBEDDING_DIMENSIONS = 1536;

/* ── ai_conversations ──────────────────────────────────────────────── */

export const aiConversations = pgTable(
  "ai_conversations",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Optional lesson scope for the lesson-scoped AI panel. */
    lessonId: uuid("lesson_id").references(() => lessons.id, {
      onDelete: "set null",
    }),
    mode: aiModeEnum("mode").notNull().default("explain"),
    status: aiConversationStatusEnum("status").notNull().default("open"),
    /** Minimal redacted context snapshot (tier, lesson, progress — no PII). */
    contextSnapshot: jsonb("context_snapshot").notNull().default({}),
  },
  (table) => [
    index("ai_conversations_org_idx").on(table.orgId),
    index("ai_conversations_user_idx").on(table.userId),
    index("ai_conversations_status_idx").on(table.status),
  ],
);

/* ── ai_messages ───────────────────────────────────────────────────── */

export const aiMessages = pgTable(
  "ai_messages",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => aiConversations.id, { onDelete: "cascade" }),
    role: aiMessageRoleEnum("role").notNull(),
    /** Stored already PII-redacted (PROJECT.md §6.5). */
    content: text("content").notNull(),
    /** Moderation / financial-advice classifier flags. */
    policyFlags: jsonb("policy_flags").notNull().default([]),
    /** Citations to retrieved chunks (lesson snippet ids). */
    citations: jsonb("citations").notNull().default([]),
  },
  (table) => [
    index("ai_messages_conversation_idx").on(table.conversationId),
    index("ai_messages_org_idx").on(table.orgId),
  ],
);

/* ── course_chunks (pgvector retrieval index) ──────────────────────── */

export const courseChunks = pgTable(
  "course_chunks",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    sourceType: chunkSourceTypeEnum("source_type").notNull(),
    /** Id of the originating lesson/strategy/etc. (for citations + re-index). */
    sourceRefId: uuid("source_ref_id"),
    /** Human-readable citation label shown inline with AI answers. */
    sourceLabel: varchar("source_label", { length: 240 }),
    /** The chunk text that was embedded (approved content only). */
    content: text("content").notNull(),
    /** pgvector embedding; cosine/ivfflat index defined in policies SQL. */
    embedding: vector("embedding", {
      dimensions: EMBEDDING_DIMENSIONS,
    }),
    /** Ordinal within its source document. */
    chunkIndex: integer("chunk_index").notNull().default(0),
    metadata: jsonb("metadata").notNull().default({}),
  },
  (table) => [
    uniqueIndex("course_chunks_source_chunk_uq").on(
      table.sourceType,
      table.sourceRefId,
      table.chunkIndex,
    ),
    index("course_chunks_org_idx").on(table.orgId),
    index("course_chunks_source_idx").on(table.sourceType, table.sourceRefId),
  ],
);

/* ── relations ─────────────────────────────────────────────────────── */

export const aiConversationsRelations = relations(
  aiConversations,
  ({ many, one }) => ({
    messages: many(aiMessages),
    user: one(users, {
      fields: [aiConversations.userId],
      references: [users.id],
    }),
  }),
);

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiMessages.conversationId],
    references: [aiConversations.id],
  }),
}));

/* ── validation contracts ──────────────────────────────────────────── */

export const insertAiConversationSchema = createInsertSchema(aiConversations);
export const selectAiConversationSchema = createSelectSchema(aiConversations);

export const insertAiMessageSchema = createInsertSchema(aiMessages);
export const selectAiMessageSchema = createSelectSchema(aiMessages);

export const insertCourseChunkSchema = createInsertSchema(courseChunks);
export const selectCourseChunkSchema = createSelectSchema(courseChunks);
