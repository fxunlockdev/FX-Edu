'use client';

import { useState } from 'react';
import { ReportDialog } from './ReportDialog';

/**
 * Interactive footer for a post: react, reply (placeholder), save, and report.
 * Isolated as a client leaf so the post `<article>` and the page shell stay
 * server-rendered.
 *
 * Reactions + save are OPTIMISTIC and local only — there is no persistence wired
 * yet (the reaction/save tables land with the realtime backend). Reply opens a
 * placeholder. Report opens the moderation dialog, which files a report (stubbed)
 * and notes that actions are admin-side + audited.
 * // TODO: persist reactions/save + thread replies once the community tables ship.
 */

interface PostActionsProps {
  readonly postId: string;
  readonly authorName: string;
  readonly reactions: number;
  readonly replies: number;
}

export function PostActions({ postId, authorName, reactions, replies }: PostActionsProps) {
  const [reacted, setReacted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reporting, setReporting] = useState(false);

  const reactionCount = reactions + (reacted ? 1 : 0);

  return (
    <div className="cm-actions">
      <button
        type="button"
        className={`cm-action${reacted ? ' is-on' : ''}`}
        aria-pressed={reacted}
        onClick={() => setReacted((v) => !v)}
      >
        <ThumbIcon />
        <span>{reactionCount}</span>
        <span className="sr-only"> reactions</span>
      </button>

      <button type="button" className="cm-action" aria-label={`${replies} replies`}>
        <ReplyIcon />
        <span>{replies} replies</span>
      </button>

      <button
        type="button"
        className={`cm-action${saved ? ' is-on' : ''}`}
        aria-pressed={saved}
        onClick={() => setSaved((v) => !v)}
      >
        <BookmarkIcon filled={saved} />
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>

      <button
        type="button"
        className="cm-action cm-action-report"
        onClick={() => setReporting(true)}
      >
        <FlagIcon />
        <span>Report</span>
      </button>

      {reporting && (
        <ReportDialog
          targetType="post"
          targetId={postId}
          targetLabel={`${authorName}'s post`}
          onClose={() => setReporting(false)}
        />
      )}
    </div>
  );
}

function ThumbIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 10v11M2 13l1-7h6l-1-3a2 2 0 0 1 4 0l2 7h6l-1 11H4" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.3A8.4 8.4 0 1 1 21 11.5Z" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 21V4M4 4h13l-2 4 2 4H4" />
    </svg>
  );
}
