/**
 * Engagement domain: notifications, notification_preferences.
 *
 * Both are tenant-scoped and user-owned. Notifications back the in-app inbox;
 * preferences gate fan-out per channel + type so opted-out users are never
 * emailed/pushed (PRD §8.16). Retention/purge TTLs apply to notifications
 * (PROJECT.md §6.8).
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns } from "./_shared";
import {
  notificationChannelEnum,
  notificationTypeEnum,
} from "./enums";
import { organizations, users } from "./auth";

/* ── notifications (in-app inbox) ──────────────────────────────────── */

export const notifications = pgTable(
  "notifications",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    /** Render payload (title, body, deep-link, entity refs). */
    payload: jsonb("payload").notNull().default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_org_idx").on(table.orgId),
    // Fast unread lookup per user.
    index("notifications_user_read_idx").on(table.userId, table.readAt),
  ],
);

/* ── notification_preferences (per channel + type) ─────────────────── */

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channel: notificationChannelEnum("channel").notNull(),
    type: notificationTypeEnum("type").notNull(),
    enabled: boolean("enabled").notNull().default(true),
  },
  (table) => [
    uniqueIndex("notification_prefs_user_channel_type_uq").on(
      table.userId,
      table.channel,
      table.type,
    ),
    index("notification_prefs_org_idx").on(table.orgId),
    index("notification_prefs_user_idx").on(table.userId),
  ],
);

/* ── relations ─────────────────────────────────────────────────────── */

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

/* ── validation contracts ──────────────────────────────────────────── */

export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);

export const insertNotificationPreferenceSchema = createInsertSchema(
  notificationPreferences,
);
export const selectNotificationPreferenceSchema = createSelectSchema(
  notificationPreferences,
);
