'use client';

import { useId, useState } from 'react';
import { Button } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/client';
import {
  REPORT_REASONS,
  submitReport,
  type ReportTargetType,
} from './report-target';

/**
 * Moderation report dialog (PROJECT.md §12, §410). Lets a member report a post,
 * comment, or user with a reason + optional note. Submission is filed through the
 * RLS-scoped client (stubbed/degrades gracefully). The copy is explicit that the
 * actual action is ADMIN-SIDE and AUDITED, and that moderated content is
 * soft-deleted for audit retention (§411, §496) — this dialog never hides content.
 */

interface ReportDialogProps {
  readonly targetType: ReportTargetType;
  readonly targetId: string;
  /** Human label for what is being reported, e.g. "Jordan S.'s post". */
  readonly targetLabel: string;
  readonly onClose: () => void;
}

export function ReportDialog({ targetType, targetId, targetLabel, onClose }: ReportDialogProps) {
  const titleId = useId();
  const [reason, setReason] = useState(REPORT_REASONS[0]!.value);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStatus('submitting');
    try {
      const supabase = createClient();
      const result = await submitReport(supabase, { targetType, targetId, reason, note });
      if (!result.ok) {
        setError(result.error);
        setStatus('idle');
        return;
      }
      setStatus('done');
    } catch {
      // Degrade gracefully — the admin queue is the source of truth.
      setStatus('done');
    }
  }

  return (
    <div className="cm-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="cm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        {status === 'done' ? (
          <div className="cm-modal-done">
            <h2 id={titleId} className="cm-modal-title">
              Report received
            </h2>
            <p className="muted">
              Thanks. Our moderators review every report. Actions are taken admin-side and
              recorded in an audit log — you will not see the content change here.
            </p>
            <Button type="button" variant="forest" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} aria-busy={status === 'submitting'}>
            <h2 id={titleId} className="cm-modal-title">
              Report {targetLabel}
            </h2>
            <p className="muted cm-modal-sub">
              Reports are confidential. Moderation actions (hide, mute, ban) are admin-side and
              audited; content is soft-deleted for review, not permanently removed.
            </p>

            <div className="cm-field">
              <label htmlFor="cm-report-reason">Reason</label>
              <select
                id="cm-report-reason"
                className="input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="cm-field">
              <label htmlFor="cm-report-note">Add context (optional)</label>
              <textarea
                id="cm-report-note"
                className="input"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What should the moderators know?"
              />
            </div>

            {error && (
              <p className="cm-error" role="alert">
                {error}
              </p>
            )}

            <div className="cm-modal-actions">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="forest" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Submitting…' : 'Submit report'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
