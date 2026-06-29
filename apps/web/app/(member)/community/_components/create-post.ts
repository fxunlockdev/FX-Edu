import type { SupabaseClient } from '@supabase/supabase-js';
import { CHANNELS, type ChannelKey } from './community-data';

/**
 * Create a community post via the RLS-scoped client (PROJECT.md §12, §6.1).
 *
 * Mirrors the journal `save-trade.ts` pattern: the author id is read from the
 * session (never trusted from the client) and the RLS policy keys on
 * `auth.uid()`, so a member can only ever write their own row. The Pro
 * entitlement gate is enforced server-side on the page before this is reachable,
 * and RLS enforces it again at the row level — UI locks are only hints (§6.1).
 *
 * Uploads are STUBBED: the composer captures a chart/image filename only and we
 * persist it as `attachment_name` metadata. No storage wiring, no malware scan
 * yet (PROJECT.md §12 uploads → Cloudmersive/ClamAV host, §107).
 * // TODO: wire Supabase Storage upload + ClamAV scan for chart attachments.
 *
 * DEGRADES GRACEFULLY: if `community_posts` is not deployed yet the call returns
 * a friendly error instead of throwing, so the composer can fall back to an
 * optimistic local add and the page keeps rendering seed posts.
 */

const BODY_MAX = 2000;

/**
 * Phrases that read as signal-selling / DM solicitation. PROJECT.md §12 calls for
 * auto-hold on recommendation-framed calls; this is the client-visible first pass
 * so members get immediate feedback. The authoritative hold + admin queue lives
 * server-side in the moderation pipeline (§209, §411).
 * // TODO: move authoritative auto-hold to the API moderation pipeline.
 */
const SOLICITATION_PATTERNS: ReadonlyArray<RegExp> = [
  /\bdm me\b/i,
  /\bpm me\b/i,
  /\bjoin my (vip|signal|telegram|whatsapp|discord)\b/i,
  /\bsignal(s)? (group|service|provider)\b/i,
  /\bguaranteed (profit|returns|win)\b/i,
  /\bbuy now\b/i,
  /\bsell now\b/i,
];

export interface CreatePostInput {
  readonly channel: ChannelKey;
  readonly body: string;
  /** Stubbed attachment filename (no bytes uploaded). */
  readonly attachmentName: string | null;
}

export type CreatePostResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string; readonly held?: boolean };

const VALID_CHANNELS: ReadonlySet<string> = new Set(CHANNELS.map((c) => c.key));

/** Pure, testable validation + auto-hold check for a draft post. */
export function validatePost(input: CreatePostInput): CreatePostResult {
  const body = input.body.trim();

  if (!VALID_CHANNELS.has(input.channel)) {
    return { ok: false, error: 'Pick a valid channel before posting.' };
  }
  if (body.length === 0) {
    return { ok: false, error: 'Write something before posting.' };
  }
  if (body.length > BODY_MAX) {
    return { ok: false, error: `Keep posts under ${BODY_MAX} characters.` };
  }
  if (SOLICITATION_PATTERNS.some((re) => re.test(body))) {
    return {
      ok: false,
      held: true,
      error:
        'This reads like signal-selling or a DM solicitation, which is held for review. Share your reasoning instead.',
    };
  }

  return { ok: true };
}

export async function createPost(
  supabase: SupabaseClient,
  input: CreatePostInput,
): Promise<CreatePostResult> {
  const validation = validatePost(input);
  if (!validation.ok) return validation;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'Your session has expired. Please log in again.' };
  }

  const { error } = await supabase.from('community_posts').insert({
    user_id: user.id,
    channel: input.channel,
    body: input.body.trim(),
    // Stubbed: filename only, no bytes. Server worker scans + rehosts later.
    attachment_name: input.attachmentName,
  });

  if (error) {
    return {
      ok: false,
      error: 'We could not post right now. Your draft is kept — please try again.',
    };
  }

  return { ok: true };
}
