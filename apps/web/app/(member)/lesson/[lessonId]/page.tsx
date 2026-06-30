import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { getViewerPlan } from '@/lib/entitlements/plan';
import { SignOutButton } from '../../_components/SignOutButton';
import {
  allLessonIds,
  isPro,
  locateLesson,
  nextLesson,
  readProgress,
} from '../../learn/_components';
import { LessonPlayer, getLessonContent, type NextLessonRef } from '../_components';
import '../lesson.css';

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

/** Pre-render every lesson route from the static catalogue. */
export function generateStaticParams(): { lessonId: string }[] {
  return allLessonIds().map((lessonId) => ({ lessonId }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const location = locateLesson(lessonId);
  return {
    title: location ? `${location.lesson.title} · Lesson` : 'Lesson',
    robots: { index: false, follow: false },
  };
}

/** XP per completed lesson — presentational; server is authoritative (§8.4). */
const LESSON_XP = 50;

/**
 * Lesson Player page (RSC shell — M3 / PROJECT.md §8.4). The `(member)` layout
 * guarantees a session. This shell:
 *  1. resolves the lesson from the static catalogue (404s on unknown ids),
 *  2. reads plan from the shared entitlements helper (Basic by default) and
 *     applies the course gate server-side — a Basic member on a Pro course sees
 *     the upgrade prompt, never the player. The server-side gate is
 *     authoritative; the UI lock is a hint (§6.1),
 *  3. reads the user's resume position + completion through the RLS-scoped client
 *     (degrades to "start from 0" if `lesson_progress` is not deployed),
 *  4. hands all of that to the interactive `LessonPlayer` client leaf.
 *
 * Free preview lessons stay watchable on any plan so the value is visible before
 * upgrading.
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const location = locateLesson(lessonId);
  if (!location) notFound();

  const { course, module: lessonModule, lesson, index, total } = location;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const plan = await getViewerPlan();
  const proCourse = course.access === 'pro';
  const locked = proCourse && !isPro(plan) && !lesson.preview;

  const moduleNumber = course.modules.findIndex((m) => m.id === lessonModule.id) + 1;

  // Read this lesson's resume/completion through the RLS-scoped client. The read
  // is skipped for a gated lesson (no player is rendered) and degrades to "start
  // from 0" if the `lesson_progress` table is not deployed yet.
  const progress = !locked && user ? await readProgress(supabase, [lesson.id]) : null;
  const row = progress?.get(lesson.id);
  const next = resolveNext(location);

  return (
    <div className="lp-page">
      <header className="lp-top">
        <a href="/dashboard" aria-label="FX Academy dashboard">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={plan === 'basic' ? 'outline' : 'lime-dark'}>
            {plan === 'basic' ? 'Basic' : 'Pro'}
          </Badge>
          <a href="/learn" className="btn btn-ghost btn-sm">
            Exit to library
          </a>
          <SignOutButton />
        </div>
      </header>

      <main className="lp-main" id="main">
        <p className="lp-crumb muted">
          {course.level} · {lessonModule.title} ·{' '}
          <span className="lp-crumb-mod">Module {moduleNumber}</span>
        </p>
        <h1 className="h-md lp-h1">
          Lesson {index + 1} of {total}: {lesson.title}
        </h1>

        {locked ? (
          <LockedLesson courseTitle={course.title} />
        ) : (
          <LessonPlayer
            lessonId={lesson.id}
            content={getLessonContent(lesson.id)}
            resumeSeconds={row?.positionSeconds ?? 0}
            durationSeconds={lesson.durationSeconds}
            alreadyComplete={row?.completed ?? false}
            xp={LESSON_XP}
            next={next}
          />
        )}

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </main>
    </div>
  );
}

/** Resolve the next lesson (in-course) into the player's lightweight ref. */
function resolveNext(location: ReturnType<typeof locateLesson>): NextLessonRef | null {
  if (!location) return null;
  const upcoming = nextLesson(location);
  return upcoming ? { id: upcoming.id, title: upcoming.title } : null;
}

/**
 * Server-side gate view for a Pro lesson on a Basic plan. No player, no transcript
 * — the gated material is not rendered. The real enforcement is the API; this is
 * the designed locked state (§6.1, §8.4).
 */
function LockedLesson({ courseTitle }: { courseTitle: string }) {
  return (
    <div className="lp-gate">
      <span className="lp-gate-icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </span>
      <h2>This lesson is included with Pro</h2>
      <p className="muted">
        {courseTitle} is part of the full curriculum. Upgrade to Pro to watch every lesson, take the
        quizzes and earn certificate progress.
      </p>
      <a href="/pricing" className="btn btn-lime btn-sm">
        See Pro plans
      </a>
      <a href="/learn" className="btn btn-ghost btn-sm lp-gate-back">
        Back to Learning Paths
      </a>
    </div>
  );
}
