/**
 * Learning domain: courses, modules, lessons, lesson_assets, progress,
 * quizzes, quiz_attempts, certificates.
 *
 * Content (courses/modules/lessons/assets/quizzes/strategies) is tenant-scoped:
 * global FX Academy curriculum lives under the system org; partners may add
 * their own content under their org. Per-user records (progress, quiz_attempts,
 * certificates) are tenant-scoped AND user-owned.
 *
 * Entitlement gating is enforced server-side + by RLS on read; `accessLevel`
 * on a course is the minimum plan needed and is a hint mirrored into the
 * entitlements package.
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

import { baseColumns } from "./_shared.js";
import {
  accessLevelEnum,
  courseTierEnum,
  lessonAssetKindEnum,
  publishStatusEnum,
  quizAttemptResultEnum,
} from "./enums.js";
import { organizations, users } from "./auth.js";

/* ── courses ───────────────────────────────────────────────────────── */

export const courses = pgTable(
  "courses",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    tier: courseTierEnum("tier").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description"),
    accessLevel: accessLevelEnum("access_level").notNull().default("pro"),
    status: publishStatusEnum("status").notNull().default("draft"),
    /** Estimated minutes; surfaced on course cards + filters. */
    durationMinutes: integer("duration_minutes").notNull().default(0),
    /** Whether finishing this course can contribute to a certificate. */
    certificateEligible: boolean("certificate_eligible")
      .notNull()
      .default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    uniqueIndex("courses_org_slug_uq").on(table.orgId, table.slug),
    index("courses_org_idx").on(table.orgId),
    index("courses_tier_idx").on(table.tier),
    index("courses_status_idx").on(table.status),
  ],
);

/* ── modules ───────────────────────────────────────────────────────── */

export const modules = pgTable(
  "modules",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("modules_course_idx").on(table.courseId),
    index("modules_org_idx").on(table.orgId),
  ],
);

/* ── lessons ───────────────────────────────────────────────────────── */

export const lessons = pgTable(
  "lessons",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    /** Mux playback id for the primary video asset (signed playback only). */
    muxPlaybackId: varchar("mux_playback_id", { length: 255 }),
    transcript: text("transcript"),
    notes: text("notes"),
    /** Quiz policy: { requiresQuiz, minWatchPercent }. */
    quizPolicy: jsonb("quiz_policy").notNull().default({}),
    status: publishStatusEnum("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("lessons_module_idx").on(table.moduleId),
    index("lessons_org_idx").on(table.orgId),
  ],
);

/* ── lesson_assets ─────────────────────────────────────────────────── */

export const lessonAssets = pgTable(
  "lesson_assets",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    kind: lessonAssetKindEnum("kind").notNull(),
    /** Supabase Storage object key OR Mux asset id (private, signed access). */
    storageKey: text("storage_key").notNull(),
    /** Adaptive renditions / captions / DRM metadata. */
    metadata: jsonb("metadata").notNull().default({}),
    /** Asset stays unservable until malware scan passes (PROJECT.md §6.6). */
    scanStatus: varchar("scan_status", { length: 20 })
      .notNull()
      .default("pending"),
  },
  (table) => [
    index("lesson_assets_lesson_idx").on(table.lessonId),
    index("lesson_assets_org_idx").on(table.orgId),
  ],
);

/* ── progress (per-user) ───────────────────────────────────────────── */

export const progress = pgTable(
  "progress",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    /** 0–100; written ≥ every 15s + on pause/exit, server-acked. */
    watchPercent: integer("watch_percent").notNull().default(0),
    lastPositionSeconds: integer("last_position_seconds").notNull().default(0),
    xpAwarded: integer("xp_awarded").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("progress_user_lesson_uq").on(table.userId, table.lessonId),
    index("progress_org_idx").on(table.orgId),
    index("progress_user_idx").on(table.userId),
  ],
);

/* ── quizzes ───────────────────────────────────────────────────────── */

export const quizzes = pgTable(
  "quizzes",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id").references(() => lessons.id, {
      onDelete: "cascade",
    }),
    courseId: uuid("course_id").references(() => courses.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 200 }).notNull(),
    /** Question set (prompts, options, correct indices) as structured JSON. */
    questions: jsonb("questions").notNull().default([]),
    passingThreshold: integer("passing_threshold").notNull().default(70),
  },
  (table) => [
    index("quizzes_lesson_idx").on(table.lessonId),
    index("quizzes_course_idx").on(table.courseId),
    index("quizzes_org_idx").on(table.orgId),
  ],
);

/* ── quiz_attempts (per-user) ──────────────────────────────────────── */

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    quizId: uuid("quiz_id")
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    answers: jsonb("answers").notNull().default([]),
    /** Score is recomputed server-side; never trusted from the client. */
    score: integer("score").notNull().default(0),
    result: quizAttemptResultEnum("result").notNull(),
  },
  (table) => [
    index("quiz_attempts_user_idx").on(table.userId),
    index("quiz_attempts_quiz_idx").on(table.quizId),
    index("quiz_attempts_org_idx").on(table.orgId),
  ],
);

/* ── certificates (per-user, server-minted) ────────────────────────── */

export const certificates = pgTable(
  "certificates",
  {
    ...baseColumns,
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").references(() => courses.id, {
      onDelete: "set null",
    }),
    tier: courseTierEnum("tier").notNull(),
    /** Public verification id (opaque, minimal-disclosure verify URL). */
    verificationId: varchar("verification_id", { length: 64 }).notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    /** Supabase Storage key for the generated PDF (worker-produced). */
    pdfStorageKey: text("pdf_storage_key"),
  },
  (table) => [
    uniqueIndex("certificates_verification_uq").on(table.verificationId),
    uniqueIndex("certificates_user_tier_course_uq").on(
      table.userId,
      table.tier,
      table.courseId,
    ),
    index("certificates_org_idx").on(table.orgId),
  ],
);

/* ── relations ─────────────────────────────────────────────────────── */

export const coursesRelations = relations(courses, ({ many }) => ({
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  assets: many(lessonAssets),
}));

/* ── validation contracts ──────────────────────────────────────────── */

export const insertCourseSchema = createInsertSchema(courses);
export const selectCourseSchema = createSelectSchema(courses);

export const insertModuleSchema = createInsertSchema(modules);
export const selectModuleSchema = createSelectSchema(modules);

export const insertLessonSchema = createInsertSchema(lessons);
export const selectLessonSchema = createSelectSchema(lessons);

export const insertLessonAssetSchema = createInsertSchema(lessonAssets);
export const selectLessonAssetSchema = createSelectSchema(lessonAssets);

export const insertProgressSchema = createInsertSchema(progress);
export const selectProgressSchema = createSelectSchema(progress);

export const insertQuizSchema = createInsertSchema(quizzes);
export const selectQuizSchema = createSelectSchema(quizzes);

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts);
export const selectQuizAttemptSchema = createSelectSchema(quizAttempts);

export const insertCertificateSchema = createInsertSchema(certificates);
export const selectCertificateSchema = createSelectSchema(certificates);
