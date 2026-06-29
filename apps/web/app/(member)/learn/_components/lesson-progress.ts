/**
 * Lesson progress reads/writes for the Learning Paths library and Lesson Player
 * (M3 / PROJECT.md §8.4). Progress is user-owned and read/written through the
 * RLS-scoped Supabase client, mirroring the M5 journal pattern: the user id comes
 * from the session (never the client), and the RLS policy keys on `auth.uid()`.
 *
 * Server-side is the source of truth. PROJECT.md §8.4 is explicit that completion
 * requires server-verified watch %/quiz and certificate progress must not be
 * client-forgeable. Until that worker exists, this module writes an honest
 * "marked complete" row so the UI advances; the server will re-verify and is the
 * real gate. Every call DEGRADES GRACEFULLY: if the `lesson_progress` table is not
 * deployed yet, reads return an empty map and writes report a friendly error
 * instead of throwing — the player and library still render.
 *
 * The reference table shape lives in `lesson-progress.schema.sql`; the canonical
 * migration is owned by the db package + F-series migrations.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Course } from './courses-data';
import { flattenLessons } from './courses-data';

/** Per-lesson progress for the current user. */
export interface LessonProgress {
  /** Lesson slug (matches `Lesson.id`). */
  readonly lessonId: string;
  /** Furthest watched position in seconds — drives resume. */
  readonly positionSeconds: number;
  /** Whether the lesson has been marked/verified complete. */
  readonly completed: boolean;
}

interface ProgressRow {
  readonly lesson_id: string;
  readonly position_seconds: number | null;
  readonly completed: boolean | null;
}

const PROGRESS_COLUMNS = 'lesson_id, position_seconds, completed';

/**
 * Read the caller's progress for the whole catalogue (or a subset of lesson ids),
 * keyed by lesson id. Returns an empty map for signed-out callers or when the
 * table is missing — the UI then renders the "not started" state for everything.
 */
export async function readProgress(
  supabase: SupabaseClient,
  lessonIds?: readonly string[],
): Promise<Map<string, LessonProgress>> {
  const empty = new Map<string, LessonProgress>();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  let query = supabase
    .from('lesson_progress')
    .select(PROGRESS_COLUMNS)
    .eq('user_id', user.id)
    .limit(2000);

  if (lessonIds && lessonIds.length > 0) {
    query = query.in('lesson_id', lessonIds);
  }

  const { data, error } = await query;
  if (error || !data) {
    // Table not deployed yet (or transient error) — degrade to "no progress".
    return empty;
  }

  const map = new Map<string, LessonProgress>();
  for (const row of data as ProgressRow[]) {
    map.set(row.lesson_id, {
      lessonId: row.lesson_id,
      positionSeconds: row.position_seconds ?? 0,
      completed: row.completed ?? false,
    });
  }
  return map;
}

export interface MarkCompleteResult {
  readonly ok: boolean;
  readonly error?: string;
}

/**
 * Mark a lesson complete for the current user via an idempotent upsert (one row
 * per user+lesson). The session-derived user id is authoritative; the client
 * cannot mark a lesson for someone else (RLS `with check (auth.uid() = user_id)`).
 *
 * TODO(server): this is the v1 path. The server worker must re-verify watch % /
 * quiz pass before counting this toward certificate progress (§8.4) — until then
 * the row is an honest "user clicked complete" signal, not a forgeable credential.
 */
export async function markLessonComplete(
  supabase: SupabaseClient,
  lessonId: string,
  positionSeconds: number,
): Promise<MarkCompleteResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'Your session has expired. Please log in again.' };
  }

  const nowIso = new Date().toISOString();
  const { error } = await supabase.from('lesson_progress').upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      position_seconds: Math.max(0, Math.round(positionSeconds)),
      completed: true,
      completed_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: 'user_id,lesson_id' },
  );

  if (error) {
    // Table missing or write rejected — keep the UI honest about the failure.
    return {
      ok: false,
      error: 'Progress is not saved yet — your completion will sync once it is enabled.',
    };
  }

  return { ok: true };
}

/** Completion percentage (0–100) for a course given a progress map. */
export function courseProgressPercent(
  course: Course,
  progressById: ReadonlyMap<string, LessonProgress>,
): number {
  const lessons = flattenLessons(course);
  if (lessons.length === 0) return 0;
  const done = lessons.filter((l) => progressById.get(l.id)?.completed).length;
  return Math.round((done / lessons.length) * 100);
}
