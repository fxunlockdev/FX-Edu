import { describe, expect, it } from 'vitest';
import {
  COURSES,
  allLessonIds,
  firstLessonId,
  flattenLessons,
  getCourse,
  lessonCount,
  locateLesson,
  nextLesson,
} from './courses-data';
import {
  DURATION_BUCKETS,
  applyFilters,
  buildCardModels,
  resolveDifficulty,
  resolveDuration,
  resolveTab,
  toQueryString,
  type CourseCardModel,
  type LibraryState,
} from './library-filters';
import { courseProgressPercent, type LessonProgress } from './lesson-progress';
import { derivePlan, isPro } from './plan';

/**
 * Learning Paths pure-logic tests (M3 / PROJECT.md §8.4). Deterministic, no I/O.
 * The lock/plan and progress logic is the security-relevant surface — the UI must
 * never grant access it cannot prove — so the defensive default, lock rules and
 * the catalogue↔curriculum integrity are the priority. Real enforcement is
 * server-side; this guards the hint and the catalogue shape.
 */

const baseState: LibraryState = {
  tab: 'All',
  query: '',
  difficulty: null,
  duration: null,
  certificateOnly: false,
};

function progressMap(entries: Record<string, boolean>): Map<string, LessonProgress> {
  const map = new Map<string, LessonProgress>();
  for (const [lessonId, completed] of Object.entries(entries)) {
    map.set(lessonId, { lessonId, positionSeconds: 0, completed });
  }
  return map;
}

describe('catalogue ↔ curriculum integrity', () => {
  it('builds exactly one course per curriculum tier', () => {
    expect(COURSES).toHaveLength(5);
    expect(COURSES.map((c) => c.level)).toEqual([
      'Entry',
      'Beginner',
      'Intermediate',
      'Advanced',
      'Psychology',
    ]);
  });

  it('gives every course at least one module and one lesson', () => {
    for (const course of COURSES) {
      expect(course.modules.length).toBeGreaterThan(0);
      expect(lessonCount(course)).toBeGreaterThan(0);
    }
  });

  it('has globally unique lesson ids', () => {
    const ids = allLessonIds();
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.length > 0)).toBe(true);
  });

  it('resolves every lesson id back to its course/module', () => {
    for (const id of allLessonIds()) {
      const located = locateLesson(id);
      expect(located?.lesson.id).toBe(id);
      expect(located?.module.lessons.some((l) => l.id === id)).toBe(true);
    }
  });

  it('returns undefined for unknown lesson and course ids', () => {
    expect(locateLesson('nope')).toBeUndefined();
    expect(getCourse('nope')).toBeUndefined();
  });

  it('marks the first lesson of each course as a free preview', () => {
    for (const course of COURSES) {
      const first = flattenLessons(course)[0]!;
      expect(first.preview).toBe(true);
    }
  });
});

describe('lesson navigation', () => {
  it('firstLessonId points at the first flattened lesson', () => {
    const course = COURSES[0]!;
    expect(firstLessonId(course)).toBe(flattenLessons(course)[0]!.id);
  });

  it('nextLesson advances within a course and stops at the end', () => {
    const course = COURSES[0]!;
    const flat = flattenLessons(course);
    const firstLoc = locateLesson(flat[0]!.id);
    const lastLoc = locateLesson(flat[flat.length - 1]!.id);
    expect(firstLoc && nextLesson(firstLoc)?.id).toBe(flat[1]!.id);
    expect(lastLoc && nextLesson(lastLoc)).toBeUndefined();
  });
});

describe('plan derivation — defensive default', () => {
  it('defaults to basic when no user id is provided', () => {
    expect(derivePlan(undefined)).toBe('basic');
    expect(derivePlan('user-123')).toBe('basic');
    expect(isPro(derivePlan('user-123'))).toBe(false);
  });
});

describe('lock state (hint)', () => {
  it('locks Pro courses only on Basic plans', () => {
    const basicModels = buildCardModels(false, new Map());
    const proModels = buildCardModels(true, new Map());
    const proCourse = COURSES.find((c) => c.access === 'pro');
    expect(proCourse).toBeDefined();

    const lockedForBasic = basicModels.find((m) => m.course.id === proCourse?.id);
    const lockedForPro = proModels.find((m) => m.course.id === proCourse?.id);
    expect(lockedForBasic?.locked).toBe(true);
    expect(lockedForPro?.locked).toBe(false);
  });

  it('never locks Basic courses', () => {
    const models = buildCardModels(false, new Map());
    for (const m of models) {
      if (m.course.access === 'basic') expect(m.locked).toBe(false);
    }
  });
});

describe('progress', () => {
  it('is 0 with no progress and 100 when every lesson is complete', () => {
    const course = COURSES[0]!;
    expect(courseProgressPercent(course, new Map())).toBe(0);
    const all = Object.fromEntries(flattenLessons(course).map((l) => [l.id, true]));
    expect(courseProgressPercent(course, progressMap(all))).toBe(100);
  });

  it('is a partial percentage for partial completion', () => {
    const course = COURSES[0]!;
    const flat = flattenLessons(course);
    const one = progressMap({ [flat[0]!.id]: true });
    const pct = courseProgressPercent(course, one);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThan(100);
  });
});

describe('URL state resolvers', () => {
  it('resolveTab narrows to known tabs and defaults to All', () => {
    expect(resolveTab(undefined)).toBe('All');
    expect(resolveTab('Bogus')).toBe('All');
    expect(resolveTab('Completed')).toBe('Completed');
    expect(resolveTab('Psychology')).toBe('Psychology');
  });

  it('resolveDifficulty + resolveDuration narrow or null out', () => {
    expect(resolveDifficulty('Advanced')).toBe('Advanced');
    expect(resolveDifficulty('xx')).toBeNull();
    expect(resolveDuration('short')).toBe('short');
    expect(resolveDuration('xx')).toBeNull();
  });

  it('toQueryString omits defaults and serializes active state', () => {
    expect(toQueryString(baseState)).toBe('');
    const qs = toQueryString({
      ...baseState,
      tab: 'Advanced',
      query: 'liquidity',
      difficulty: 'Advanced',
      duration: 'long',
      certificateOnly: true,
    });
    const params = new URLSearchParams(qs);
    expect(params.get('tab')).toBe('Advanced');
    expect(params.get('q')).toBe('liquidity');
    expect(params.get('difficulty')).toBe('Advanced');
    expect(params.get('duration')).toBe('long');
    expect(params.get('cert')).toBe('1');
  });
});

describe('applyFilters', () => {
  const models: CourseCardModel[] = buildCardModels(false, new Map());

  it('returns every course for the default state', () => {
    expect(applyFilters(models, baseState)).toHaveLength(models.length);
  });

  it('filters by tier tab', () => {
    const advanced = applyFilters(models, { ...baseState, tab: 'Advanced' });
    expect(advanced.length).toBeGreaterThan(0);
    expect(advanced.every((m) => m.course.level === 'Advanced')).toBe(true);
  });

  it('My Courses = in-progress; Completed = fully done', () => {
    const course = COURSES[0]!;
    const flat = flattenLessons(course);
    const partial = buildCardModels(false, progressMap({ [flat[0]!.id]: true }));
    const myCourses = applyFilters(partial, { ...baseState, tab: 'My Courses' });
    expect(myCourses.some((m) => m.course.id === course.id)).toBe(true);
    expect(applyFilters(partial, { ...baseState, tab: 'Completed' })).toHaveLength(0);

    const allDone = buildCardModels(
      false,
      progressMap(Object.fromEntries(flat.map((l) => [l.id, true]))),
    );
    const completed = applyFilters(allDone, { ...baseState, tab: 'Completed' });
    expect(completed.some((m) => m.course.id === course.id)).toBe(true);
  });

  it('filters by difficulty', () => {
    const beginner = applyFilters(models, { ...baseState, difficulty: 'Beginner' });
    expect(beginner.every((m) => m.course.difficulty === 'Beginner')).toBe(true);
  });

  it('filters by duration bucket bounds', () => {
    for (const bucket of DURATION_BUCKETS) {
      const filtered = applyFilters(models, { ...baseState, duration: bucket.value });
      expect(
        filtered.every(
          (m) =>
            m.course.durationMinutes >= bucket.min &&
            (bucket.max === null || m.course.durationMinutes < bucket.max),
        ),
      ).toBe(true);
    }
  });

  it('certificate-only keeps only certificate courses', () => {
    const certs = applyFilters(models, { ...baseState, certificateOnly: true });
    expect(certs.every((m) => m.course.certificate)).toBe(true);
  });

  it('searches title, summary, level and module names', () => {
    const term = COURSES[0]!.modules[0]!.title.split(' ')[0]!.toLowerCase();
    const found = applyFilters(models, { ...baseState, query: term });
    expect(found.length).toBeGreaterThan(0);
    expect(applyFilters(models, { ...baseState, query: 'zzz-no-match-zzz' })).toHaveLength(0);
  });
});
