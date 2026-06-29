'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@fxunlock/ui';

/**
 * The single `'use client'` interactive leaf of Elite Cohort & Coaching (M21 /
 * PROJECT.md §9 module 21). Everything else on the page is a server component.
 *
 * It is the educator Q&A submission form. The backend is STUBBED — there is no
 * Q&A table or queue wired yet, so on submit we validate locally and show an
 * optimistic "received" acknowledgement WITHOUT persisting anything. When the
 * Elite Q&A backend lands, `onSubmit` posts to a Server Action / route instead.
 *
 * Education-only: the placeholder and helper copy steer questions toward process
 * and learning, and never invite (or answer with) trade signals or advice.
 */

const MAX_LEN = 600;

export function AskQuestionForm() {
  const baseId = useId();
  const fieldId = `${baseId}-question`;
  const hintId = `${baseId}-hint`;
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = value.trim();
  const remaining = MAX_LEN - value.length;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmed.length < 10) {
      setError('Add a little more detail so an educator can give a useful answer.');
      return;
    }
    // TODO: wire to the Elite Q&A backend (Server Action → moderated queue).
    // No persistence yet — acknowledge optimistically so the surface is real.
    setError(null);
    setSubmitted(true);
  };

  const askAnother = () => {
    setValue('');
    setSubmitted(false);
    setError(null);
  };

  if (submitted) {
    return (
      <div className="el-qa-ack" role="status" aria-live="polite">
        <span className="el-qa-ack-badge" aria-hidden="true">
          ✓
        </span>
        <div>
          <p className="el-qa-ack-title">Question received</p>
          <p className="el-qa-ack-body muted">
            An educator will answer it and add it to the Elite Q&amp;A library. This is a preview —
            Q&amp;A delivery is coming soon, so nothing was sent yet.
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={askAnother}>
            Ask another question
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="el-qa-form" onSubmit={onSubmit} noValidate>
      <label htmlFor={fieldId} className="el-qa-label">
        Your question for the educators
      </label>
      <textarea
        id={fieldId}
        className="input el-qa-input"
        rows={4}
        maxLength={MAX_LEN}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (error) setError(null);
        }}
        placeholder="e.g. How do I build a pre-session routine that keeps me disciplined?"
        aria-describedby={hintId}
        aria-invalid={error ? true : undefined}
      />
      <div className="el-qa-meta">
        <p id={hintId} className="el-qa-hint muted">
          {error ? (
            <span className="el-qa-error">{error}</span>
          ) : (
            'Process and learning questions get the best answers. Educators do not give trade signals or advice.'
          )}
        </p>
        <span className="el-qa-count" aria-hidden="true">
          {remaining}
        </span>
      </div>
      <Button type="submit" variant="lime" size="sm">
        Submit question
      </Button>
    </form>
  );
}
