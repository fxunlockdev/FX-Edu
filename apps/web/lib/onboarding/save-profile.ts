import type { SupabaseClient } from '@supabase/supabase-js';
import type { TradingProfile } from './profile-fields';

/**
 * Persists the trading profile to the `profiles` table via the browser client.
 * RLS scopes the upsert to the signed-in user (the policy keys on
 * `auth.uid() = id`), so a user can only ever write their own row — the client
 * key carries no extra authority (PROJECT.md §6.1).
 *
 * `profiles.id` is the user's `auth.users` id (1:1). We upsert so a re-run
 * (resumed onboarding) updates rather than duplicates. Column names are
 * snake_case to match the SQL migration in `lib/onboarding/profiles.schema.sql`.
 *
 * NOTE: the `profiles` table is provisioned by the orchestrator (Supabase
 * migration). If it does not exist yet, the call returns a friendly error
 * instead of throwing, so onboarding degrades gracefully during bring-up.
 */
export interface SaveProfileResult {
  readonly ok: boolean;
  readonly error?: string;
}

export async function saveTradingProfile(
  supabase: SupabaseClient,
  profile: TradingProfile,
): Promise<SaveProfileResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: 'Your session has expired. Please log in again.' };
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      experience_level: profile.experience,
      main_goal: profile.goal,
      account_size: profile.accountSize,
      risk_comfort: profile.riskComfort,
      acquisition_source: profile.source,
      onboarded_at: new Date().toISOString(),
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
