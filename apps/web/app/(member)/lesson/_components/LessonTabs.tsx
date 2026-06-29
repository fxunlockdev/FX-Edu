'use client';

import { useState } from 'react';
import type { LessonContent } from './lesson-content';

export type LessonTabKey = 'transcript' | 'notes' | 'quiz';

interface LessonTabsProps {
  readonly content: LessonContent;
  readonly active: LessonTabKey;
  /** Stub: download notes as a file (no real export wired yet). */
  readonly onDownloadNotes: () => void;
}

/**
 * The Transcript / Lesson notes / Mini quiz tab panels (PROJECT.md §8.4). Pure
 * presentational client component driven by the active-tab key the player owns.
 * The mini quiz is interactive but self-contained — answering reveals correctness
 * and an explanation; it does not write progress (the server worker verifies quiz
 * pass before it counts toward certificates, §8.4).
 */
export function LessonTabs({ content, active, onDownloadNotes }: LessonTabsProps) {
  if (active === 'transcript') {
    return (
      <div className="lp-transcript" aria-label="Lesson transcript">
        {content.transcript.map((cue) => (
          <p key={cue.time}>
            <strong>[{cue.time}]</strong> {cue.text}
          </p>
        ))}
      </div>
    );
  }

  if (active === 'notes') {
    return (
      <div className="lp-notes">
        <h3>Key points</h3>
        <ul>
          {content.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDownloadNotes}>
          Download notes
        </button>
      </div>
    );
  }

  return <MiniQuiz quiz={content.quiz} />;
}

function MiniQuiz({ quiz }: { quiz: LessonContent['quiz'] }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === quiz.correct;

  return (
    <div>
      <div className="lp-quiz-head">
        <span className="chip chip-lime">Mini quiz</span>
        <span className="muted">Pass to advance certificate progress</span>
      </div>
      <h3 className="lp-quiz-q">{quiz.prompt}</h3>

      <div role="radiogroup" aria-label={quiz.prompt}>
        {quiz.options.map((option, i) => {
          const isCorrect = answered && i === quiz.correct;
          const isWrong = answered && i === picked && i !== quiz.correct;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={picked === i}
              disabled={answered}
              className={`lp-quiz-opt${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}`}
              onClick={() => setPicked(i)}
            >
              <span className="lp-quiz-letter">{String.fromCharCode(65 + i)}</span>
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <p className={`lp-quiz-result ${correct ? 'pos' : 'neg'}`} role="status">
          {correct ? `Correct — ${quiz.explanation}` : 'Not quite — review the transcript, then try the next lesson.'}
        </p>
      )}
    </div>
  );
}
