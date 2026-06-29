'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerStage } from './PlayerStage';
import { LessonTabs, type LessonTabKey } from './LessonTabs';
import { CompletionModal } from './CompletionModal';
import { completeLessonAction } from './complete-action';
import type { LessonContent } from './lesson-content';

export interface NextLessonRef {
  readonly id: string;
  readonly title: string;
}

interface LessonPlayerProps {
  readonly lessonId: string;
  readonly content: LessonContent;
  /** Resume position from `lesson_progress` (0 when none/unwired). */
  readonly resumeSeconds: number;
  readonly durationSeconds: number;
  /** Whether the lesson was already marked complete. */
  readonly alreadyComplete: boolean;
  /** XP awarded on completion (presentational). */
  readonly xp: number;
  /** The next lesson in the course, if any. */
  readonly next: NextLessonRef | null;
}

/**
 * Interactive Lesson Player leaf (M3 / PROJECT.md §8.4). The RSC page stays a
 * server component and auth-gates; this owns all client state: the stubbed video
 * surface, the tab switcher, the action row (bookmark / download notes / mark
 * complete) and the completion modal.
 *
 * "Mark complete" calls the `completeLessonAction` server action inside a
 * transition, so the user id and the RLS write happen server-side. On success the
 * completion modal opens (XP, mini-quiz CTA, journal-note CTA, next-lesson CTA).
 * If the progress table is not deployed yet the action returns a friendly error
 * and we surface it inline instead of throwing — the lesson still works.
 *
 * Bookmark and download-notes are stubs (no persistence/export wired); they give
 * lightweight, honest feedback.
 */
export function LessonPlayer({
  lessonId,
  content,
  resumeSeconds,
  durationSeconds,
  alreadyComplete,
  xp,
  next,
}: LessonPlayerProps) {
  const router = useRouter();
  const [tab, setTab] = useState<LessonTabKey>('transcript');
  const [bookmarked, setBookmarked] = useState(false);
  const [completed, setCompleted] = useState(alreadyComplete);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleComplete() {
    setNotice(null);
    startTransition(async () => {
      // TODO(server): worker re-verifies watch %/quiz before this counts toward
      // certificate progress (§8.4). v1 records "user clicked complete".
      const result = await completeLessonAction(lessonId, resumeSeconds);
      if (result.ok) {
        setCompleted(true);
        setModalOpen(true);
        router.refresh();
      } else {
        // Degrade gracefully: still celebrate locally, but be honest about sync.
        setCompleted(true);
        setModalOpen(true);
        setNotice(result.error ?? 'Your progress could not be saved right now.');
      }
    });
  }

  return (
    <>
      <PlayerStage
        resumeSeconds={resumeSeconds}
        durationSeconds={durationSeconds}
        onCaptions={() => setNotice('Captions will be available once streaming is enabled.')}
        onSpeed={() => undefined}
      />

      <div className="lp-actions">
        <div className="lp-tabbar" role="tablist" aria-label="Lesson content">
          <TabButton id="transcript" active={tab} onSelect={setTab} label="Transcript" />
          <TabButton id="notes" active={tab} onSelect={setTab} label="Lesson notes" />
          <TabButton id="quiz" active={tab} onSelect={setTab} label="Mini quiz" />
        </div>

        <div className="lp-action-btns">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            aria-pressed={bookmarked}
            onClick={() => {
              setBookmarked((b) => !b);
              setNotice(bookmarked ? null : 'Lesson bookmarked.');
            }}
          >
            {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setNotice('Downloadable notes (PDF) arrive with the content pipeline.')}
          >
            ↓ Notes
          </button>
          <button
            type="button"
            className="btn btn-lime btn-sm"
            disabled={pending}
            onClick={handleComplete}
          >
            {pending ? 'Saving…' : completed ? '✓ Completed' : 'Mark complete'}
          </button>
        </div>
      </div>

      {notice && (
        <p className="lp-notice" role="status">
          {notice}
        </p>
      )}

      <div
        className="card card-pad lp-tabpanel"
        role="tabpanel"
        aria-label={`${tab} content`}
      >
        <LessonTabs
          content={content}
          active={tab}
          onDownloadNotes={() =>
            setNotice('Downloadable notes (PDF) arrive with the content pipeline.')
          }
        />
      </div>

      <CompletionModal
        open={modalOpen}
        xp={xp}
        next={next}
        onClose={() => setModalOpen(false)}
        onTakeQuiz={() => {
          setModalOpen(false);
          setTab('quiz');
        }}
      />
    </>
  );
}

function TabButton({
  id,
  active,
  onSelect,
  label,
}: {
  id: LessonTabKey;
  active: LessonTabKey;
  onSelect: (id: LessonTabKey) => void;
  label: string;
}) {
  const on = active === id;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      className={`lp-tab${on ? ' on' : ''}`}
      onClick={() => onSelect(id)}
    >
      {label}
    </button>
  );
}
