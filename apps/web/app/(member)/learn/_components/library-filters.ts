/**
 * Pure filter + tab logic for the Learning Paths library (M3). The library state
 * lives entirely in the URL (`?tab=&q=&difficulty=&duration=&cert=`) so a
 * filtered view is shareable and back-button friendly (web URL-as-state pattern).
 * The RSC page reads these params, derives the values here, and renders the
 * filtered grid server-side — no client data fetching.
 *
 * Everything in this file is a pure function so it is trivially unit-testable.
 */

import type { Course, CourseDifficulty } from './courses-data';
import { COURSES, lessonCount } from './courses-data';
import type { LessonProgress } from './lesson-progress';
import { courseProgressPercent } from './lesson-progress';

/** Library tabs (PROJECT.md §8.4). `All` is the default. */
export const LIBRARY_TABS = [
  'All',
  'My Courses',
  'Entry',
  'Beginner',
  'Intermediate',
  'Advanced',
  'Psychology',
  'Completed',
] as const;

export type LibraryTab = (typeof LIBRARY_TABS)[number];

/** Difficulty filter options. */
export const DIFFICULTY_OPTIONS: readonly CourseDifficulty[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

/** Duration filter buckets, keyed by a url-safe value. */
export interface DurationBucket {
  readonly value: string;
  readonly label: string;
  /** Inclusive lower / exclusive upper bound in minutes (`null` = open). */
  readonly min: number;
  readonly max: number | null;
}

export const DURATION_BUCKETS: readonly DurationBucket[] = [
  { value: 'short', label: 'Under 1 hr', min: 0, max: 60 },
  { value: 'medium', label: '1–4 hrs', min: 60, max: 240 },
  { value: 'long', label: 'Over 4 hrs', min: 240, max: null },
];

/** Resolved, validated library state. */
export interface LibraryState {
  readonly tab: LibraryTab;
  readonly query: string;
  readonly difficulty: CourseDifficulty | null;
  readonly duration: string | null;
  /** When true, only certificate-bearing courses are shown. */
  readonly certificateOnly: boolean;
}

/** Narrow an arbitrary string to a known tab, defaulting to `All`. */
export function resolveTab(value: string | undefined): LibraryTab {
  return (LIBRARY_TABS as readonly string[]).includes(value ?? '')
    ? (value as LibraryTab)
    : 'All';
}

/** Narrow a difficulty param, or `null` for "all difficulty". */
export function resolveDifficulty(value: string | undefined): CourseDifficulty | null {
  return DIFFICULTY_OPTIONS.includes((value ?? '') as CourseDifficulty)
    ? (value as CourseDifficulty)
    : null;
}

/** Narrow a duration param to a known bucket value, or `null` for "any". */
export function resolveDuration(value: string | undefined): string | null {
  return DURATION_BUCKETS.some((b) => b.value === value) ? (value as string) : null;
}

/**
 * A course paired with the viewer's derived progress + lock state — the shape the
 * grid renders. Locking is a presentation hint (the server is the real gate).
 */
export interface CourseCardModel {
  readonly course: Course;
  /** 0–100 completion across the course's lessons. */
  readonly progress: number;
  /** True when the course is gated above the viewer's plan. */
  readonly locked: boolean;
  /** Lesson count (cached so the card doesn't recompute). */
  readonly lessons: number;
}

/**
 * Decorate every course with the viewer's progress + lock state. `isPro` and the
 * progress map come from the server (entitlements + the `progress` table); both
 * default safely when unwired.
 */
export function buildCardModels(
  isPro: boolean,
  progressById: ReadonlyMap<string, LessonProgress>,
): CourseCardModel[] {
  return COURSES.map((course) => ({
    course,
    progress: courseProgressPercent(course, progressById),
    locked: course.access === 'pro' && !isPro,
    lessons: lessonCount(course),
  }));
}

/** Does a course match the active tab? */
function matchesTab(model: CourseCardModel, tab: LibraryTab): boolean {
  switch (tab) {
    case 'All':
      return true;
    case 'My Courses':
      return model.progress > 0 && model.progress < 100;
    case 'Completed':
      return model.progress === 100;
    default:
      // Tier tabs (Entry/Beginner/Intermediate/Advanced/Psychology).
      return model.course.level === tab;
  }
}

/** Does a course fall inside the selected duration bucket? */
function matchesDuration(model: CourseCardModel, durationValue: string | null): boolean {
  if (!durationValue) return true;
  const bucket = DURATION_BUCKETS.find((b) => b.value === durationValue);
  if (!bucket) return true;
  const minutes = model.course.durationMinutes;
  return minutes >= bucket.min && (bucket.max === null || minutes < bucket.max);
}

/** Free-text search across course title, summary, level and module names. */
function matchesQuery(model: CourseCardModel, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const { course } = model;
  const haystack = [
    course.title,
    course.summary,
    course.level,
    course.difficulty,
    ...course.modules.map((m) => m.title),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

/** Apply the full resolved filter state to the decorated course list. */
export function applyFilters(
  models: readonly CourseCardModel[],
  state: LibraryState,
): CourseCardModel[] {
  return models.filter(
    (model) =>
      matchesTab(model, state.tab) &&
      matchesQuery(model, state.query) &&
      (state.difficulty === null || model.course.difficulty === state.difficulty) &&
      matchesDuration(model, state.duration) &&
      (!state.certificateOnly || model.course.certificate),
  );
}

/** Serialize library state back to a `/learn` query string (omitting defaults). */
export function toQueryString(state: LibraryState): string {
  const qs = new URLSearchParams();
  if (state.tab !== 'All') qs.set('tab', state.tab);
  if (state.query.trim()) qs.set('q', state.query.trim());
  if (state.difficulty) qs.set('difficulty', state.difficulty);
  if (state.duration) qs.set('duration', state.duration);
  if (state.certificateOnly) qs.set('cert', '1');
  return qs.toString();
}
