'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/client';
import { markAllRead } from '../mark-read';

/**
 * "Mark all read" control (PROJECT.md §8.16). Writes through the RLS-scoped
 * client, then refreshes the RSC so the unread count + row styling re-render
 * from the server (source of truth). Hidden when there is nothing unread.
 */
export function MarkAllReadButton({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!hasUnread) return null;

  async function onClick() {
    setBusy(true);
    try {
      await markAllRead(createClient());
      router.refresh();
    } catch {
      // Soft-fail: the unread count simply stays; the user can retry.
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} disabled={busy}>
      {busy ? 'Marking…' : 'Mark all read'}
    </Button>
  );
}
