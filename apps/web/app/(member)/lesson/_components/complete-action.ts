'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { markLessonComplete, type MarkCompleteResult } from '../../learn/_components/lesson-progress';

/**
 * Server Action: mark a lesson complete for the signed-in user (M3 / PROJECT.md
 * §8.4). Runs on the server so the user id is taken from the session — the client
 * never asserts identity, and the RLS policy enforces ownership.
 *
 * On success we revalidate `/learn` so the library's progress bars + tabs (My
 * Courses / Completed) reflect the new state on the user's next visit. The write
 * degrades gracefully when the `lesson_progress` table is not deployed yet:
 * `markLessonComplete` returns a friendly error instead of throwing.
 *
 * TODO(server): the dedicated worker must re-verify watch %/quiz before this
 * counts toward certificate progress (§8.4 — completion must not be forgeable).
 */
export async function completeLessonAction(
  lessonId: string,
  positionSeconds: number,
): Promise<MarkCompleteResult> {
  if (!lessonId) {
    return { ok: false, error: 'Missing lesson reference.' };
  }

  const supabase = await createClient();
  const result = await markLessonComplete(supabase, lessonId, positionSeconds);

  if (result.ok) {
    revalidatePath('/learn');
  }

  return result;
}
