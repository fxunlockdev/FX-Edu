/**
 * Course + lesson catalogue for the Learning Paths library and Lesson Player
 * (M3 / PROJECT.md §8.4). Derived from the canonical five-tier curriculum
 * (`apps/web/app/curriculum/_sections/curriculum-data.ts`) — one course per tier,
 * with each curriculum *module* expanded into a small set of lessons so the
 * library and the player share a single source of truth.
 *
 * Plan access here is a presentation HINT only. Course unlocks are decided and
 * verified server-side (PROJECT.md §6.1 / §8.4 — "Course unlocks
 * entitlement-checked server-side; UI locks are hints"). Nothing in this file
 * gates content; it drives the grid, the locked-state messaging and the player
 * shell. Progress shown here is sample/static until the `progress` table is
 * wired (see `lesson-progress.ts`).
 */

import { CURRICULUM_TIERS, type CurriculumTier } from '@/app/curriculum/_sections/curriculum-data';

/** Lowest plan that unlocks a course (mirrors the curriculum `TierAccess`). */
export type CourseAccess = 'basic' | 'pro';

/** Difficulty buckets used by the library's difficulty filter. */
export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/** Tier label — doubles as the library tab key. */
export type CourseLevel = 'Entry' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Psychology';

/** A single lesson inside a module. */
export interface Lesson {
  /** Stable slug, unique across the whole catalogue — the `[lessonId]` param. */
  readonly id: string;
  /** Lesson title shown in the player and the outline. */
  readonly title: string;
  /** Approximate runtime label, e.g. "8 min". */
  readonly duration: string;
  /** Runtime in seconds — drives the player's seek/time read. */
  readonly durationSeconds: number;
  /** Free preview lessons are watchable on any plan (the rest follow course access). */
  readonly preview: boolean;
}

/** A module groups a handful of lessons under one heading. */
export interface CourseModule {
  /** Stable slug, unique within the course. */
  readonly id: string;
  /** Module heading (the curriculum module name). */
  readonly title: string;
  /** Ordered lessons within the module. */
  readonly lessons: readonly Lesson[];
}

/** A course is the library card unit — one per curriculum tier. */
export interface Course {
  /** Stable slug used in links and the `[lessonId]` namespace. */
  readonly id: string;
  /** Card + detail title. */
  readonly title: string;
  /** Tier label (also the tab key). */
  readonly level: CourseLevel;
  /** Difficulty bucket for the difficulty filter. */
  readonly difficulty: CourseDifficulty;
  /** Approximate total time-on-content, e.g. "1.5 hr". */
  readonly duration: string;
  /** Total runtime in minutes — drives the duration filter buckets. */
  readonly durationMinutes: number;
  /** Lowest plan that unlocks the course (presentation hint only). */
  readonly access: CourseAccess;
  /** Whether finishing the course advances certificate progress. */
  readonly certificate: boolean;
  /** One-line summary (from the curriculum tier). */
  readonly summary: string;
  /** Ordered modules; lessons live inside. */
  readonly modules: readonly CourseModule[];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Derivation: curriculum tiers → courses.
 *
 * The curriculum dataset gives each tier a list of module names plus a total
 * lesson count. We deterministically distribute that lesson count across the
 * named modules (front-loading the remainder) so the catalogue stays in lockstep
 * with the curriculum: change the curriculum and the library follows.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Difficulty bucket for a tier — Entry/Beginner read as Beginner difficulty. */
function difficultyForLevel(level: CourseLevel): CourseDifficulty {
  if (level === 'Intermediate') return 'Intermediate';
  if (level === 'Advanced') return 'Advanced';
  // Entry, Beginner and Psychology sit in the Beginner difficulty bucket.
  return 'Beginner';
}

/** Slugify a human label into a url-safe id fragment. */
function slug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Parse the curriculum tier's "3.5 hrs" duration into whole minutes. */
function tierMinutes(duration: string): number {
  const match = duration.match(/([\d.]+)\s*(hr|min)/i);
  if (!match) return 60;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return 60;
  const unit = match[2] ?? '';
  return /hr/i.test(unit) ? Math.round(value * 60) : Math.round(value);
}

/** Lesson-count distribution: spread `total` across `moduleCount`, remainder first. */
function distribute(total: number, moduleCount: number): number[] {
  if (moduleCount <= 0) return [];
  const base = Math.floor(total / moduleCount);
  const remainder = total - base * moduleCount;
  return Array.from({ length: moduleCount }, (_, i) => base + (i < remainder ? 1 : 0));
}

/** A short, deterministic lesson runtime in seconds (varies 6–11 min by index). */
function lessonSeconds(index: number): number {
  return (6 + (index % 6)) * 60 + 30; // 6:30 … 11:30
}

function buildCourse(tier: CurriculumTier): Course {
  const level = tier.title as CourseLevel;
  const courseId = slug(tier.title);
  const perModule = distribute(tier.lessonCount, tier.modules.length);

  let lessonOrdinal = 0;
  const modules: CourseModule[] = tier.modules.map((moduleTitle, moduleIndex) => {
    const lessonCount = perModule[moduleIndex] ?? 1;
    const moduleId = `${courseId}-${slug(moduleTitle)}`;
    const lessons: Lesson[] = Array.from({ length: lessonCount }, (_, i) => {
      const seconds = lessonSeconds(lessonOrdinal);
      const lesson: Lesson = {
        id: `${moduleId}-l${i + 1}`,
        title: lessonCount === 1 ? moduleTitle : `${moduleTitle} · part ${i + 1}`,
        duration: `${Math.round(seconds / 60)} min`,
        durationSeconds: seconds,
        // First lesson of the first module of each course is a free preview.
        preview: moduleIndex === 0 && i === 0,
      };
      lessonOrdinal += 1;
      return lesson;
    });
    return { id: moduleId, title: moduleTitle, lessons };
  });

  return {
    id: courseId,
    title: tier.title === 'Psychology' ? 'Trading Psychology' : `${tier.title} — ${tier.modules[0]}`,
    level,
    difficulty: difficultyForLevel(level),
    duration: tier.duration.replace('hrs', 'hr'),
    durationMinutes: tierMinutes(tier.duration),
    access: tier.access,
    certificate: tier.certificate,
    summary: tier.summary,
    modules,
  };
}

/** The full catalogue — one course per curriculum tier, in curriculum order. */
export const COURSES: readonly Course[] = CURRICULUM_TIERS.map(buildCourse);

/* ────────────────────────────────────────────────────────────────────────────
 * Lookups + derived helpers.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Flatten every lesson with its parent course/module for player navigation. */
export interface LessonLocation {
  readonly course: Course;
  readonly module: CourseModule;
  readonly lesson: Lesson;
  /** Zero-based index in the course's flattened lesson order. */
  readonly index: number;
  /** Total lessons in the course. */
  readonly total: number;
}

/** Ordered, flattened lessons for a course (module order, then lesson order). */
export function flattenLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons);
}

/** Total lesson count for a course. */
export function lessonCount(course: Course): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

/** Find a course by id. */
export function getCourse(courseId: string): Course | undefined {
  return COURSES.find((c) => c.id === courseId);
}

/** Resolve a lesson id to its course/module/position, or `undefined`. */
export function locateLesson(lessonId: string): LessonLocation | undefined {
  for (const course of COURSES) {
    const flat = flattenLessons(course);
    const index = flat.findIndex((l) => l.id === lessonId);
    if (index === -1) continue;
    const lesson = flat[index];
    if (!lesson) continue;
    const module = course.modules.find((m) => m.lessons.some((l) => l.id === lesson.id));
    if (!module) continue;
    return { course, module, lesson, index, total: flat.length };
  }
  return undefined;
}

/** The next lesson in the same course, or `undefined` at the end. */
export function nextLesson(location: LessonLocation): Lesson | undefined {
  const flat = flattenLessons(location.course);
  return flat[location.index + 1];
}

/** The first lesson of a course — the "Start"/"Continue" target. */
export function firstLessonId(course: Course): string | undefined {
  return flattenLessons(course)[0]?.id;
}

/** Every lesson id across the catalogue (for `generateStaticParams`). */
export function allLessonIds(): string[] {
  return COURSES.flatMap((c) => flattenLessons(c).map((l) => l.id));
}
