import { NextResponse, type NextRequest } from 'next/server';
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE, sanitizeRef } from '@/lib/referral';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * One middleware, two jobs (PROJECT.md §9 module 1 + module 2):
 *
 *  1. Capture a `?ref=` referral code into a sanitized, http-only cookie so the
 *     attribution survives navigation into checkout. The value is validated +
 *     sanitized (lib/referral.ts) before storage — never the raw query string —
 *     so it cannot carry a payload. We only set the cookie when it is absent,
 *     preserving last-touch on the first arrival.
 *
 *  2. Refresh the Supabase auth session (lib/supabase/middleware.ts) so the
 *     session cookie stays valid for server-side route guards and RSC reads.
 *
 * These are composed onto the SAME response: we build the response, attach the
 * referral cookie, then hand it to `updateSession`, which syncs the refreshed
 * auth cookies onto it. Order matters — Supabase must write last so it can read
 * the request cookies and own the auth cookie sync.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });

  const rawRef = request.nextUrl.searchParams.get('ref');
  const code = sanitizeRef(rawRef);

  if (code && !request.cookies.has(REFERRAL_COOKIE)) {
    response.cookies.set(REFERRAL_COOKIE, code, {
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  return updateSession(request, response);
}

export const config = {
  // Run on page routes only; skip static assets and API internals.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
