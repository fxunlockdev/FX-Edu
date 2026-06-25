import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getSupabaseEnv } from './env';

/**
 * Supabase session refresh for middleware (per @supabase/ssr App Router
 * guidance). Runs on every matched request: it reads the auth cookies, lets the
 * SDK rotate an expiring session, and writes the refreshed cookies onto BOTH the
 * request (so downstream handlers see the new session) and the response (so the
 * browser persists it).
 *
 * This is COMPOSED with the existing `?ref=` capture in `middleware.ts`: the
 * caller passes in a response we have already prepared (carrying any referral
 * cookie) and we mutate it in place, so one middleware does both jobs.
 *
 * IMPORTANT (per Supabase docs): do not run logic between creating the client
 * and calling `getUser()`, and always return the same response object whose
 * cookies were synced — otherwise the session can desync and silently log users
 * out.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the user to trigger a refresh of an expiring session. The result is
  // intentionally unused here — route guards re-check via the server client.
  await supabase.auth.getUser();

  return response;
}
