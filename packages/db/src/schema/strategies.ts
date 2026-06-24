/**
 * Strategies & market context domain: strategies, trade_ideas, market_quotes,
 * news_items.
 *
 * `strategies` (playbooks) and `trade_ideas` (educator examples) are
 * tenant-scoped content. `market_quotes` and `news_items` are GLOBAL cached
 * provider data (no `org_id`) — labelled "educational context," cached
 * server-side with a TTL, attributed per license (PROJECT.md §11).
 *
 * Nothing here is a signal: trade_ideas require a disclosure ack before publish.
 */
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns } from "./_shared.js";
import {
  accessLevelEnum,
  difficultyEnum,
  newsImpactEnum,
  publishStatusEnum,
  strategyCategoryEnum,
  tradeBiasEnum,
} from "./enums.js";
import { lessons } from "./learning.js";
import { organizations, users } from "./auth.js";

/* ── strategies (playbooks, tenant-scoped) ─────────────────────────── */

export const strategies = pgTable(
  "strategies",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    category: strategyCategoryEnum("category").notNull(),
    difficulty: difficultyEnum("difficulty").notNull().default("beginner"),
    accessLevel: accessLevelEnum("access_level").notNull().default("pro"),
    /** Playbook body: concept, rules, setup, invalidation, risk notes, examples. */
    content: jsonb("content").notNull().default({}),
    /** Related lesson ids that completion can contribute progress toward. */
    relatedLessonIds: jsonb("related_lesson_ids").notNull().default([]),
    status: publishStatusEnum("status").notNull().default("draft"),
  },
  (table) => [
    uniqueIndex("strategies_org_slug_uq").on(table.orgId, table.slug),
    index("strategies_org_idx").on(table.orgId),
    index("strategies_category_idx").on(table.category),
  ],
);

/* ── trade_ideas (educator examples, tenant-scoped) ────────────────── */

export const tradeIdeas = pgTable(
  "trade_ideas",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    educatorUserId: uuid("educator_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    instrument: varchar("instrument", { length: 32 }).notNull(),
    bias: tradeBiasEnum("bias").notNull(),
    timeframe: varchar("timeframe", { length: 32 }),
    analysis: text("analysis"),
    /** Educational entry area (framed as an example, never a signal). */
    entryArea: varchar("entry_area", { length: 120 }),
    invalidation: varchar("invalidation", { length: 120 }),
    objective: varchar("objective", { length: 120 }),
    tag: varchar("tag", { length: 80 }),
    relatedLessonId: uuid("related_lesson_id").references(() => lessons.id, {
      onDelete: "set null",
    }),
    accessLevel: accessLevelEnum("access_level").notNull().default("pro"),
    chartStorageKey: text("chart_storage_key"),
    /** Disclosure acknowledgement is required before publish (PRD §8.10). */
    disclosureAckAt: timestamp("disclosure_ack_at", { withTimezone: true }),
    status: publishStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    index("trade_ideas_org_idx").on(table.orgId),
    index("trade_ideas_instrument_idx").on(table.instrument),
    index("trade_ideas_educator_idx").on(table.educatorUserId),
  ],
);

/* ── market_quotes (GLOBAL cached provider data, no org_id) ─────────── */

export const marketQuotes = pgTable(
  "market_quotes",
  {
    ...baseColumns,
    instrument: varchar("instrument", { length: 32 }).notNull(),
    /** Latest quote (mid/last) with precision. */
    quote: numeric("quote", { precision: 18, scale: 6 }).notNull(),
    /** Percent change for sparkline / dashboard cards. */
    changePercent: numeric("change_percent", { precision: 8, scale: 4 }),
    source: varchar("source", { length: 64 }).notNull(),
    quotedAt: timestamp("quoted_at", { withTimezone: true }).notNull(),
    /** Cache TTL in seconds; reads beyond this trigger a provider refetch. */
    cacheTtlSeconds: integer("cache_ttl_seconds").notNull().default(60),
  },
  (table) => [
    index("market_quotes_instrument_idx").on(table.instrument),
    index("market_quotes_quoted_at_idx").on(table.quotedAt),
  ],
);

/* ── news_items (GLOBAL cached provider data, no org_id) ────────────── */

export const newsItems = pgTable(
  "news_items",
  {
    ...baseColumns,
    source: varchar("source", { length: 120 }).notNull(),
    headline: varchar("headline", { length: 400 }).notNull(),
    impact: newsImpactEnum("impact").notNull().default("low"),
    /** Affected asset tags, e.g. ["EUR/USD","XAU/USD"]. */
    assetTags: jsonb("asset_tags").notNull().default([]),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    url: text("url"),
  },
  (table) => [
    index("news_items_published_at_idx").on(table.publishedAt),
    index("news_items_impact_idx").on(table.impact),
  ],
);

/* ── relations ─────────────────────────────────────────────────────── */

export const tradeIdeasRelations = relations(tradeIdeas, ({ one }) => ({
  educator: one(users, {
    fields: [tradeIdeas.educatorUserId],
    references: [users.id],
  }),
  relatedLesson: one(lessons, {
    fields: [tradeIdeas.relatedLessonId],
    references: [lessons.id],
  }),
}));

/* ── validation contracts ──────────────────────────────────────────── */

export const insertStrategySchema = createInsertSchema(strategies);
export const selectStrategySchema = createSelectSchema(strategies);

export const insertTradeIdeaSchema = createInsertSchema(tradeIdeas);
export const selectTradeIdeaSchema = createSelectSchema(tradeIdeas);

export const insertMarketQuoteSchema = createInsertSchema(marketQuotes);
export const selectMarketQuoteSchema = createSelectSchema(marketQuotes);

export const insertNewsItemSchema = createInsertSchema(newsItems);
export const selectNewsItemSchema = createSelectSchema(newsItems);
