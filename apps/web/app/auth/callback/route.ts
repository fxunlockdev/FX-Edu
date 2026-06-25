import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeRedirectPath } from '@/lib/auth/redirect';

/**
 * OAuth / email-confirmation callback (per @supabase/ssr App Router guidance).
 * Supabase redirects here with a `?code=`; we exchange it for a session (which
 * the server client writes to cookies) and then forward the user to their
 * destination. The `next` param is validated against open-redirect.
 *
 * On any failure we send the user to /login with an error flag rather than
 * leaking provider detail.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeRedirectPath(searchParams.get('next'), '/onboarding');

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
