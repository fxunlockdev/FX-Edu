import { Badge } from '@fxunlock/ui';
import { firstLessonId } from './courses-data';
import type { CourseCardModel } from './library-filters';

interface CourseCardProps {
  readonly model: CourseCardModel;
}

const LEVEL_BANNER: Record<string, number> = {
  Entry: 0,
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Psychology: 4,
};

/**
 * Course card for the library grid (PROJECT.md §8.4). Shows level, lessons/
 * modules count, duration, plan access, progress and lock state. Pure
 * presentational server component — the lock/progress decisions are made upstream
 * (server-side entitlements + the progress map); the lock here is a hint only.
 *
 * A locked (Pro-gated) course renders an "Upgrade to unlock" action that opens the
 * shared upgrade modal via the data attribute the client `UpgradeModal` listens
 * for — no per-card client JS.
 */
export function CourseCard({ model }: CourseCardProps) {
  const { course, progress, locked, lessons } = model;
  const bannerIndex = LEVEL_BANNER[course.level] ?? 0;
  const lessonHref = firstLessonId(course) ? `/lesson/${firstLessonId(course)}` : '/learn';

  const ctaLabel = locked
    ? 'Upgrade to unlock'
    : progress === 100
      ? 'Review'
      : progress > 0
        ? 'Continue'
        : 'Start';

  return (
    <article className="learn-card">
      <div className={`learn-thumb learn-thumb-${bannerIndex}`}>
        <Badge tone="lime-dark">{course.level}</Badge>
        {locked && (
          <span className="learn-lock" aria-label="Locked — Pro course">
            <LockIcon />
          </span>
        )}
        {course.certificate && (
          <span className="learn-cert" title="Certificate on completion" aria-hidden="true">
            <CertIcon />
          </span>
        )}
      </div>

      <div className="learn-body">
        <h2 className="learn-title">{course.title}</h2>
        <p className="learn-summary muted">{course.summary}</p>

        <div className="learn-meta">
          <span>
            {lessons} lessons · {course.modules.length} modules
          </span>
          <span aria-hidden="true">·</span>
          <span>{course.duration}</span>
          <Badge tone={course.access === 'basic' ? 'outline' : 'lime-dark'}>
            {course.access === 'basic' ? 'Basic' : 'Pro'}
          </Badge>
        </div>

        {progress > 0 ? (
          <div
            className="learn-bar"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${course.title} progress`}
          >
            <i style={{ width: `${progress}%` }} />
          </div>
        ) : (
          <div className="learn-bar-spacer" aria-hidden="true" />
        )}

        {locked ? (
          <button
            type="button"
            className="btn btn-forest btn-sm btn-block"
            data-upgrade-course={course.title}
          >
            {ctaLabel}
          </button>
        ) : (
          <a
            href={lessonHref}
            className={`btn btn-sm btn-block ${progress > 0 && progress < 100 ? 'btn-lime' : 'btn-forest'}`}
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </article>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CertIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13l-1.5 7L12 18l4.5 2L15 13" />
    </svg>
  );
}
