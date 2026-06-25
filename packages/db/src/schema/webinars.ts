/**
 * Webinars domain: webinars, webinar_registrations, webinar_recordings.
 *
 * Live sessions are entitlement-gated (Mux private playback for Pro/Elite);
 * public free webinars allow name+email registration. Recordings auto-attach to
 * the replay library after a worker produces the VOD + transcript + AI summary.
 *
 * All three tables are tenant-scoped (a partner runs its own webinars).
 */
import { relations } from "drizzle-orm";
import {
  boolean,
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

import { baseColumns } from "./_shared";
import {
  accessLevelEnum,
  recordingStatusEnum,
  webinarRegistrationStatusEnum,
  webinarStatusEnum,
} from "./enums";
import { organizations, users } from "./auth";

/* ── webinars ──────────────────────────────────────────────────────── */

export const webinars = pgTable(
  "webinars",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    /** Host display name (educator). */
    host: varchar("host", { length: 200 }).notNull(),
    /** Educator user who owns the session. */
    hostUserId: uuid("host_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    topic: varchar("topic", { length: 120 }),
    accessLevel: accessLevelEnum("access_level").notNull().default("pro"),
    status: webinarStatusEnum("status").notNull().default("scheduled"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    timezone: varchar("timezone", { length: 64 }).notNull().default("UTC"),
    /** Optional registration cap (null = uncapped). */
    registrationCap: integer("registration_cap"),
    /** Mux live config: ingest/stream key refs (secrets live in Doppler). */
    streamConfig: jsonb("stream_config").notNull().default({}),
    recordingEnabled: boolean("recording_enabled").notNull().default(true),
    chatEnabled: boolean("chat_enabled").notNull().default(true),
  },
  (table) => [
    index("webinars_org_idx").on(table.orgId),
    index("webinars_starts_at_idx").on(table.startsAt),
    index("webinars_status_idx").on(table.status),
  ],
);

/* ── webinar_registrations ─────────────────────────────────────────── */

export const webinarRegistrations = pgTable(
  "webinar_registrations",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    webinarId: uuid("webinar_id")
      .notNull()
      .references(() => webinars.id, { onDelete: "cascade" }),
    /** Null for public free registrants captured by email only. */
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    /** Public-registration name + email (no account required). */
    name: varchar("name", { length: 200 }),
    email: varchar("email", { length: 320 }).notNull(),
    status: webinarRegistrationStatusEnum("status")
      .notNull()
      .default("registered"),
    /** Reminder dispatch ledger: { confirm, t24h, t1h, t30m } timestamps. */
    reminders: jsonb("reminders").notNull().default({}),
  },
  (table) => [
    uniqueIndex("webinar_registrations_webinar_email_uq").on(
      table.webinarId,
      table.email,
    ),
    index("webinar_registrations_org_idx").on(table.orgId),
    index("webinar_registrations_user_idx").on(table.userId),
  ],
);

/* ── webinar_recordings ────────────────────────────────────────────── */

export const webinarRecordings = pgTable(
  "webinar_recordings",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    webinarId: uuid("webinar_id")
      .notNull()
      .references(() => webinars.id, { onDelete: "cascade" }),
    /** Mux playback id / Storage prefix for the VOD (signed access). */
    playbackId: varchar("playback_id", { length: 255 }),
    transcript: text("transcript"),
    aiSummary: text("ai_summary"),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    status: recordingStatusEnum("status").notNull().default("pending"),
  },
  (table) => [
    uniqueIndex("webinar_recordings_webinar_uq").on(table.webinarId),
    index("webinar_recordings_org_idx").on(table.orgId),
    index("webinar_recordings_status_idx").on(table.status),
  ],
);

/* ── relations ─────────────────────────────────────────────────────── */

export const webinarsRelations = relations(webinars, ({ many, one }) => ({
  registrations: many(webinarRegistrations),
  recording: one(webinarRecordings, {
    fields: [webinars.id],
    references: [webinarRecordings.webinarId],
  }),
}));

/* ── validation contracts ──────────────────────────────────────────── */

export const insertWebinarSchema = createInsertSchema(webinars);
export const selectWebinarSchema = createSelectSchema(webinars);

export const insertWebinarRegistrationSchema =
  createInsertSchema(webinarRegistrations);
export const selectWebinarRegistrationSchema =
  createSelectSchema(webinarRegistrations);

export const insertWebinarRecordingSchema =
  createInsertSchema(webinarRecordings);
export const selectWebinarRecordingSchema =
  createSelectSchema(webinarRecordings);
