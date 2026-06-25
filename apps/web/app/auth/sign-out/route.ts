import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Sign-out route handler. A POST clears the Supabase session server-side (so the
 * cookies are properly invalidated) and redirects home. POST-only so a stray
 * link/prefetch can never log the user out (CSRF-safe with the cookie scope).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/', request.nextUrl.origin), { status: 303 });
}
