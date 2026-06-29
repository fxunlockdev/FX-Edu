import type { SupabaseClient } from '@supabase/supabase-js';
import {
  MAX_BIO,
  MAX_DISPLAY_NAME,
  MAX_FULL_NAME,
  isCountry,
  isDefaultSession,
  isRiskProfile,
  prefsToRow,
  type NotificationPrefs,
} from './settings-fields';

/**
 * Settings persistence (PROJECT.md §8.16). Mirrors the M2 `save-profile.ts`
 * pattern exactly: the user id is read from the session server-side (never
 * trusted from the client), and the RLS policy keys on `auth.uid() = id`, so a
 * user can only ever write their own row. The browser anon key carries no extra
 * authority (§6.1).
 *
 * All writes degrade gracefully: if the underlying table is not provisioned yet
 * (orchestrator-owned migration), the call returns a friendly error instead of
 * throwing, so Settings stays usable during bring-up.
 *
 * NOTE on email: the email field is part of Supabase Auth, NOT the `profiles`
 * row. Changing it is a security-sensitive, step-up + re-verification flow and
 * is handled separately in `security-actions.ts` (`requestEmailChange`), not
 * here.
 */

export interface SaveResult {
  readonly ok: boolean;
  readonly error?: string;
}

export interface ProfileInput {
  readonly fullName: string;
  readonly displayName: string;
  /** ISO-3166 alpha-2 country code, or '' for "prefer not to say". */
  readonly country: string;
  readonly bio: string;
}

/** Trim + length-clamp a free-text field. Never trust client length. */
function clamp(value: string, max: number): string {
  return value.trim().slice(0, max);
}

/**
 * Persist the profile (names, country, bio) to the RLS-scoped `profiles` row.
 * Validates at the boundary (ENGINEERING.md "Validate at every boundary"):
 * names/bio are trimmed + length-clamped; an unknown country is rejected rather
 * than written. `full_name` is required; the rest are optional.
 */
export async function saveProfileSettings(
  supabase: SupabaseClient,
  input: ProfileInput,
): Promise<SaveResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'Your session has expired. Please log in again.' };
  }

  const fullName = clamp(input.fullName, MAX_FULL_NAME);
  if (fullName.length === 0) {
    return { ok: false, error: 'Please enter your full name.' };
  }

  const country = input.country.trim();
  if (country !== '' && !isCountry(country)) {
    return { ok: false, error: 'Please choose a country from the list.' };
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      full_name: fullName,
      display_name: clamp(input.displayName, MAX_DISPLAY_NAME) || null,
      country: country || null,
      bio: clamp(input.bio, MAX_BIO) || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    return {
      ok: false,
      error: 'We could not save your profile right now. Please try again.',
    };
  }

  return { ok: true };
}

export interface LearningPrefsInput {
  readonly riskProfile: string;
  readonly defaultSession: string;
}

/**
 * Persist learning preferences (risk profile, default session) to `profiles`.
 * Both values are validated against the allowed option sets before the write.
 */
export async function saveLearningPrefs(
  supabase: SupabaseClient,
  input: LearningPrefsInput,
): Promise<SaveResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'Your session has expired. Please log in again.' };
  }

  if (!isRiskProfile(input.riskProfile)) {
    return { ok: false, error: 'Please choose a valid risk profile.' };
  }
  if (!isDefaultSession(input.defaultSession)) {
    return { ok: false, error: 'Please choose a valid default session.' };
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      risk_profile: input.riskProfile,
      default_session: input.defaultSession,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    return {
      ok: false,
      error: 'We could not save your preferences right now. Please try again.',
    };
  }

  return { ok: true };
}

/**
 * Persist the five notification toggles to `notification_preferences` (one row
 * per user, keyed by `user_id` under RLS). Upsert so re-saves update in place.
 *
 * The Lifecycle Messaging module (§9 module 15) reads these columns before
 * fan-out, so opting out here suppresses the corresponding email/push.
 */
export async function saveNotificationPrefs(
  supabase: SupabaseClient,
  prefs: NotificationPrefs,
): Promise<SaveResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'Your session has expired. Please log in again.' };
  }

  const { error } = await supabase.from('notification_preferences').upsert(
    {
      user_id: user.id,
      ...prefsToRow(prefs),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    return {
      ok: false,
      error: 'We could not save your notification settings. Please try again.',
    };
  }

  return { ok: true };
}
