import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Notification read-state mutations (PROJECT.md §8.16). RLS-scoped exactly like
 * the other member writes: the `notifications_update_own` policy keys on
 * `auth.uid() = user_id`, so a user can only ever mark their own rows read.
 * We still constrain the write client-side to unread rows (`is('read_at', null)`)
 * to avoid needless updates.
 *
 * All calls degrade gracefully — if the table is not provisioned yet the call
 * resolves `{ ok: false }` rather than throwing, so the inbox stays usable.
 */

export interface MarkResult {
  readonly ok: boolean;
}

/** Mark a single notification read (no-op if already read). The user id is read
 *  from the session and the filter is scoped by `user_id` (belt-and-braces with
 *  the RLS policy) so a row can never be flipped by id alone. */
export async function markRead(
  supabase: SupabaseClient,
  id: string,
): Promise<MarkResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { ok: false };

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .is('read_at', null);

  return { ok: !error };
}

/**
 * Mark every unread notification read for the signed-in user. The user id is
 * read from the session (never trusted from the client); RLS would reject any
 * other user's rows regardless, but scoping the filter keeps the write tight.
 */
export async function markAllRead(supabase: SupabaseClient): Promise<MarkResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { ok: false };

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);

  return { ok: !error };
}
