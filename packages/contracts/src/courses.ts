import { z } from 'zod';
import {
  AccessLevelSchema,
  CourseTierSchema,
  DecisionSchema,
  IdSchema,
  IsoTimestampSchema,
} from './common.js';
import { CursorPaginationParamsSchema } from './envelope.js';

/**
 * Courses & lessons domain:
 *   GET  /courses
 *   GET  /courses/:id
 *   GET  /lessons/:id/playback-token
 *   POST /lessons/:id/progress
 *   POST /lessons/:id/complete
 *   POST /quiz-attempts
 *
 * (PRD §8.4, §11). Progress/completion are server-acknowledged; the playback
 * token is short-TTL and minted only after an entitlement check (§6.4).
 */

/** A course card / summary as shown in the library grid. */
export const CourseSummarySchema = z.object({
  id: IdSchema,
  tier: CourseTierSchema,
  title: z.string(),
  description: z.string(),
  accessLevel: AccessLevelSchema,
  lessonCount: z.number().int().nonnegative(),
  moduleCount: z.number().int().nonnegative(),
  durationMinutes: z.number().int().nonnegative(),
  certificateAvailable: z.boolean(),
  /** The caller's resolved access to this course (allow|deny|locked). */
  decision: DecisionSchema,
  /** 0–100 for the caller; null when not started. */
  progressPercent: z.number().min(0).max(100).nullable(),
});
export type CourseSummary = z.infer<typeof CourseSummarySchema>;

/** Query params for `GET /courses` — filters + cursor pagination (PRD §8.4). */
export const ListCoursesQuerySchema = CursorPaginationParamsSchema.extend({
  search: z.string().max(120).optional(),
  tier: CourseTierSchema.optional(),
  /** "all" | "my" | "completed" tab semantics. */
  scope: z.enum(['all', 'my_courses', 'completed']).default('all'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  certificateOnly: z.coerce.boolean().optional(),
});
export type ListCoursesQuery = z.infer<typeof ListCoursesQuerySchema>;

/** Response payload for `GET /courses` (list data; meta carries the cursor). */
export const ListCoursesResponseSchema = z.object({
  courses: z.array(CourseSummarySchema),
});
export type ListCoursesResponse = z.infer<typeof ListCoursesResponseSchema>;

/** A lesson row within a module. */
export const LessonSummarySchema = z.object({
  id: IdSchema,
  title: z.string(),
  durationSeconds: z.number().int().nonnegative(),
  hasQuiz: z.boolean(),
  completed: z.boolean(),
  /** Last watched position for resume (PRD §8.4). */
  resumePositionSeconds: z.number().int().nonnegative().nullable(),
});
export type LessonSummary = z.infer<typeof LessonSummarySchema>;

/** A module grouping lessons. */
export const ModuleSchema = z.object({
  id: IdSchema,
  title: z.string(),
  order: z.number().int().nonnegative(),
  lessons: z.array(LessonSummarySchema),
});
export type Module = z.infer<typeof ModuleSchema>;

/** Response payload for `GET /courses/:id`. */
export const CourseDetailResponseSchema = z.object({
  course: CourseSummarySchema,
  modules: z.array(ModuleSchema),
});
export type CourseDetailResponse = z.infer<typeof CourseDetailResponseSchema>;

/** Response payload for `GET /lessons/:id/playback-token`. */
export const PlaybackTokenResponseSchema = z.object({
  /** Signed playback token (Mux) — short-lived, per-user, per-asset. */
  token: z.string().min(1),
  /** Playback id the token authorizes. */
  playbackId: z.string().min(1),
  /** Hard expiry; client must re-request after this. */
  expiresAt: IsoTimestampSchema,
});
export type PlaybackTokenResponse = z.infer<typeof PlaybackTokenResponseSchema>;

/** Request body for `POST /lessons/:id/progress` (batched every ≥15s + pause). */
export const LessonProgressRequestSchema = z.object({
  positionSeconds: z.number().int().nonnegative(),
  watchedPercent: z.number().min(0).max(100),
  /** Idempotency key so replayed beacons don't double-count (PROJECT.md §11). */
  idempotencyKey: z.string().min(1).max(128),
});
export type LessonProgressRequest = z.infer<typeof LessonProgressRequestSchema>;

/** Response for `POST /lessons/:id/progress` — server-acknowledged state. */
export const LessonProgressResponseSchema = z.object({
  lessonId: IdSchema,
  watchedPercent: z.number().min(0).max(100),
  updatedAt: IsoTimestampSchema,
});
export type LessonProgressResponse = z.infer<typeof LessonProgressResponseSchema>;

/** Request body for `POST /lessons/:id/complete`. */
export const LessonCompleteRequestSchema = z.object({
  /** Final watched percent the client believes it reached (server verifies). */
  watchedPercent: z.number().min(0).max(100),
});
export type LessonCompleteRequest = z.infer<typeof LessonCompleteRequestSchema>;

/** Response for `POST /lessons/:id/complete`. */
export const LessonCompleteResponseSchema = z.object({
  lessonId: IdSchema,
  completed: z.boolean(),
  xpAwarded: z.number().int().nonnegative(),
  /** True if completing this lesson finished its course tier. */
  tierCompleted: z.boolean(),
  completedAt: IsoTimestampSchema.nullable(),
});
export type LessonCompleteResponse = z.infer<typeof LessonCompleteResponseSchema>;

/** A single quiz answer in an attempt. */
export const QuizAnswerSchema = z.object({
  questionId: IdSchema,
  /** Selected option id(s). Multiple for multi-select questions. */
  selectedOptionIds: z.array(IdSchema).min(1),
});
export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;

/** Request body for `POST /quiz-attempts`. */
export const QuizAttemptRequestSchema = z.object({
  quizId: IdSchema,
  lessonId: IdSchema,
  answers: z.array(QuizAnswerSchema).min(1),
});
export type QuizAttemptRequest = z.infer<typeof QuizAttemptRequestSchema>;

/** Response for `POST /quiz-attempts` — server-scored. */
export const QuizAttemptResponseSchema = z.object({
  attemptId: IdSchema,
  score: z.number().min(0).max(1),
  passed: z.boolean(),
  passingThreshold: z.number().min(0).max(1),
  submittedAt: IsoTimestampSchema,
});
export type QuizAttemptResponse = z.infer<typeof QuizAttemptResponseSchema>;
