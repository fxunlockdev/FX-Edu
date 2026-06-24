import { NextResponse, type NextRequest } from 'next/server';
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE, sanitizeRef } from '@/lib/referral';

/**
 * Captures a `?ref=` referral code into a sanitized, http-only cookie so the
 * attribution survives navigation into checkout (PROJECT.md §9 module 1).
 *
 * The value is validated + sanitized (lib/referral.ts) before it is stored —
 * never the raw query string — so it cannot carry a payload. We only set the
 * cookie when it is absent, preserving last-touch on the first arrival.
 */
export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

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

  return response;
}

export const config = {
  // Run on page routes only; skip static assets and API internals.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
