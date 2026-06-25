/**
 * Journal & analytics domain: trades, trade_attachments, analytics_snapshots.
 *
 * Private user data — tenant-scoped AND user-owned, strictly RLS-isolated.
 * R-multiple and win/loss are recomputed server-side (never trusted from the
 * client; PROJECT.md §8.8). Numeric trade fields use `numeric` for precision.
 * Analytics snapshots are computed by background workers.
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
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns } from "./_shared";
import {
  lessonAssetKindEnum,
  tradeDirectionEnum,
  tradeResultEnum,
  tradeStatusEnum,
  tradingSessionEnum,
} from "./enums";
import { organizations, users } from "./auth";

/* ── trades ────────────────────────────────────────────────────────── */

export const trades = pgTable(
  "trades",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    instrument: varchar("instrument", { length: 32 }).notNull(),
    direction: tradeDirectionEnum("direction").notNull(),
    setup: varchar("setup", { length: 120 }),
    session: tradingSessionEnum("session"),
    entry: numeric("entry", { precision: 18, scale: 6 }),
    stopLoss: numeric("stop_loss", { precision: 18, scale: 6 }),
    takeProfit: numeric("take_profit", { precision: 18, scale: 6 }),
    result: tradeResultEnum("result").notNull().default("open"),
    /** Server-computed R-multiple; not client-writable. */
    rMultiple: numeric("r_multiple", { precision: 10, scale: 2 }),
    /** Emotional state 1–10. */
    emotion: integer("emotion"),
    thesis: text("thesis"),
    /** "What would you do differently?" reflection. */
    reflection: text("reflection"),
    status: tradeStatusEnum("status").notNull().default("draft"),
    openedAt: timestamp("opened_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => [
    index("trades_org_idx").on(table.orgId),
    index("trades_user_idx").on(table.userId),
    index("trades_user_result_idx").on(table.userId, table.result),
    index("trades_instrument_idx").on(table.instrument),
  ],
);

/* ── trade_attachments ─────────────────────────────────────────────── */

export const tradeAttachments = pgTable(
  "trade_attachments",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    tradeId: uuid("trade_id")
      .notNull()
      .references(() => trades.id, { onDelete: "cascade" }),
    kind: lessonAssetKindEnum("kind").notNull().default("attachment"),
    /** Supabase Storage key; served only after malware scan passes. */
    storageKey: text("storage_key").notNull(),
    scanStatus: varchar("scan_status", { length: 20 })
      .notNull()
      .default("pending"),
  },
  (table) => [
    index("trade_attachments_trade_idx").on(table.tradeId),
    index("trade_attachments_org_idx").on(table.orgId),
  ],
);

/* ── analytics_snapshots (worker-computed) ─────────────────────────── */

export const analyticsSnapshots = pgTable(
  "analytics_snapshots",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Period label, e.g. `30d`, `2026-06`, `all`. */
    period: varchar("period", { length: 40 }).notNull(),
    /** Computed metrics blob (win rate, net R, by-session, by-setup, etc.). */
    metrics: jsonb("metrics").notNull().default({}),
    generatedAt: timestamp("generated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("analytics_snapshots_user_period_idx").on(
      table.userId,
      table.period,
    ),
    index("analytics_snapshots_org_idx").on(table.orgId),
  ],
);

/* ── relations ─────────────────────────────────────────────────────── */

export const tradesRelations = relations(trades, ({ many, one }) => ({
  attachments: many(tradeAttachments),
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
}));

export const tradeAttachmentsRelations = relations(
  tradeAttachments,
  ({ one }) => ({
    trade: one(trades, {
      fields: [tradeAttachments.tradeId],
      references: [trades.id],
    }),
  }),
);

/* ── validation contracts ──────────────────────────────────────────── */

export const insertTradeSchema = createInsertSchema(trades);
export const selectTradeSchema = createSelectSchema(trades);

export const insertTradeAttachmentSchema = createInsertSchema(tradeAttachments);
export const selectTradeAttachmentSchema = createSelectSchema(tradeAttachments);

export const insertAnalyticsSnapshotSchema =
  createInsertSchema(analyticsSnapshots);
export const selectAnalyticsSnapshotSchema =
  createSelectSchema(analyticsSnapshots);
