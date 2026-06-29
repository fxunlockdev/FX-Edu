'use client';

import { useEffect } from 'react';
import type { NextLessonRef } from './LessonPlayer';

interface CompletionModalProps {
  readonly open: boolean;
  readonly xp: number;
  readonly next: NextLessonRef | null;
  readonly onClose: () => void;
  /** Switch the page to the mini-quiz tab. */
  readonly onTakeQuiz: () => void;
}

/**
 * Lesson-completion modal (PROJECT.md §8.4): celebrates the completion and offers
 * the three follow-on CTAs — take the mini quiz, add a note to the journal, and
 * continue to the next lesson. Accessible dialog: labelled, closes on Escape and
 * backdrop click.
 *
 * XP is presentational here; the authoritative award (and certificate progress)
 * is server-verified (§8.4).
 */
export function CompletionModal({ open, xp, next, onClose, onTakeQuiz }: CompletionModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="lp-modal-bg on"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lp-done-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="lp-modal">
        <span className="lp-modal-check" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 id="lp-done-title" className="h-sm">
          Lesson complete
        </h2>
        <p className="muted lp-modal-xp-label">You earned</p>
        <div className="lp-modal-xp">+{xp} XP</div>

        <div className="lp-modal-ctas">
          <button type="button" className="btn btn-lime btn-block" onClick={onTakeQuiz}>
            Take the mini quiz
          </button>
          <a href="/journal/new" className="btn btn-ghost btn-block">
            Add a note to journal
          </a>
          {next ? (
            <a href={`/lesson/${next.id}`} className="btn btn-ghost btn-block lp-modal-next">
              Next lesson: {next.title}
            </a>
          ) : (
            <a href="/learn" className="btn btn-ghost btn-block lp-modal-next">
              Back to Learning Paths
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
