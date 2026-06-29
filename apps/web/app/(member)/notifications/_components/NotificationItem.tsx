'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { markRead } from '../mark-read';
import { kindStyle, relativeTime, type NotificationRow } from '../notification-fields';

/**
 * A single inbox row (PROJECT.md §8.16) — read-on-click. Rendering an unread row
 * applies an optimistic local "read" state immediately, then persists via the
 * RLS-scoped client and refreshes the server so the unread count stays accurate.
 * If the write fails we roll the optimistic state back (UX principle §7.4).
 *
 * The row is a `<button>` so the whole card is keyboard-activatable; read rows
 * are still focusable but no longer fire a write.
 */
export function NotificationItem({ row }: { row: NotificationRow }) {
  const router = useRouter();
  const [read, setRead] = useState(!!row.read_at);
  const style = kindStyle(row.kind);

  async function onActivate() {
    if (read) return;
    setRead(true); // optimistic
    try {
      const result = await markRead(createClient(), row.id);
      if (!result.ok) {
        setRead(false); // rollback on a soft failure
        return;
      }
      router.refresh();
    } catch {
      setRead(false); // rollback on a thrown error
    }
  }

  return (
    <button
      type="button"
      className={`ntf-row${read ? '' : ' unread'}`}
      aria-label={`${row.title}${read ? '' : ' (unread)'}`}
      onClick={onActivate}
    >
      <span className={`ntf-ic ntf-ic-${style.tone}`} aria-hidden="true">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={style.path} />
        </svg>
      </span>
      <span className="ntf-body">
        <span className="ntf-title">{row.title}</span>
        {row.body && <span className="ntf-text">{row.body}</span>}
      </span>
      <span className="ntf-time">{relativeTime(row.created_at)}</span>
    </button>
  );
}
