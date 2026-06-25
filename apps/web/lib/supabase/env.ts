/**
 * Public Supabase configuration (PROJECT.md §6.1, ENGINEERING.md "No hardcoded
 * secrets — config via env"). Both values are `NEXT_PUBLIC_*` and client-safe:
 * the URL is public and the anon/publishable key only grants what Row-Level
 * Security permits. We still validate presence so a missing env fails fast with
 * a clear message instead of a confusing runtime error deep in the SDK.
 */

interface SupabaseEnv {
  readonly url: string;
  readonly anonKey: string;
}

/** Reads + validates the public Supabase env. Throws if either var is absent. */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
  }
  if (!anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.');
  }

  return { url, anonKey };
}

/**
 * Whether the Google OAuth button should be active. Creds land later, so the
 * button stays present-but-disabled until this flips to `true` (the literal
 * string 'true' in `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED`).
 */
export function isGoogleOAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true';
}
