// Learning Paths library (M3) — internal component/data barrel.

export { CourseCard } from './CourseCard';
export { LibraryControls } from './LibraryControls';
export { UpgradeModal } from './UpgradeModal';

export {
  COURSES,
  getCourse,
  locateLesson,
  nextLesson,
  firstLessonId,
  flattenLessons,
  lessonCount,
  allLessonIds,
} from './courses-data';
export type {
  Course,
  CourseModule,
  Lesson,
  LessonLocation,
  CourseAccess,
  CourseDifficulty,
  CourseLevel,
} from './courses-data';

export {
  LIBRARY_TABS,
  DIFFICULTY_OPTIONS,
  DURATION_BUCKETS,
  applyFilters,
  buildCardModels,
  resolveTab,
  resolveDifficulty,
  resolveDuration,
  toQueryString,
} from './library-filters';
export type {
  LibraryTab,
  LibraryState,
  DurationBucket,
  CourseCardModel,
} from './library-filters';

export {
  readProgress,
  markLessonComplete,
  courseProgressPercent,
} from './lesson-progress';
export type { LessonProgress, MarkCompleteResult } from './lesson-progress';

export { isPro } from './plan';
export type { Plan } from './plan';
