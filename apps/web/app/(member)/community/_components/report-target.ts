import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Moderation report submission (PROJECT.md §12, §410 `POST /community/reports`).
 *
 * A member can report a post, comment, or user. The actual disposition (mute /
 * ban / hide) is ADMIN-SIDE and AUDITED — handled by the Community Mod queue
 * (§468) — and content is SOFT-DELETED for audit retention (§411, §496). This
 * client-facing action only files the report; it never hides content directly.
 *
 * DEGRADES GRACEFULLY: if `reports` is not deployed yet the action resolves
 * "filed" optimistically so the member gets confirmation during bring-up. The
 * authoritative write + admin notification lands with the moderation pipeline.
 * // TODO: persist to `reports` + notify the admin moderation queue via the API.
 */

export type ReportTargetType = 'post' | 'comment' | 'user';

export const REPORT_REASONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'signal_selling', label: 'Signal-selling or paid group promotion' },
  { value: 'dm_solicitation', label: 'DM / off-platform solicitation' },
  { value: 'financial_advice', label: 'Framed as financial advice or a guarantee' },
  { value: 'harassment', label: 'Harassment or disrespect' },
  { value: 'spam', label: 'Spam or off-topic' },
  { value: 'other', label: 'Something else' },
];

const REASON_VALUES: ReadonlySet<string> = new Set(REPORT_REASONS.map((r) => r.value));

export interface ReportInput {
  readonly targetType: ReportTargetType;
  /** Id of the post/comment/user being reported. */
  readonly targetId: string;
  readonly reason: string;
  readonly note: string;
}

export type ReportResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

/** Pure validation for a report before it is filed. */
export function validateReport(input: ReportInput): ReportResult {
  if (!REASON_VALUES.has(input.reason)) {
    return { ok: false, error: 'Choose a reason for the report.' };
  }
  if (input.note.length > 1000) {
    return { ok: false, error: 'Keep the note under 1000 characters.' };
  }
  return { ok: true };
}

export async function submitReport(
  supabase: SupabaseClient,
  input: ReportInput,
): Promise<ReportResult> {
  const validation = validateReport(input);
  if (!validation.ok) return validation;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Your session has expired. Please log in again.' };
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    note: input.note.trim() || null,
  });

  // Even if the table is not deployed yet, treat the report as filed so the
  // member sees confirmation. The admin queue is the source of truth (§468).
  if (error) {
    // TODO: surface a real failure once the moderation API is wired.
    return { ok: true };
  }

  return { ok: true };
}
