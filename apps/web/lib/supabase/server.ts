import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

/**
 * Server Supabase client for RSC, Route Handlers, and Server Actions
 * (per @supabase/ssr App Router guidance). Reads + writes the session through
 * the Next.js `cookies()` store so server-side auth checks are authoritative —
 * never trust the client for protected-route decisions (PROJECT.md §6.1,
 * "Server-side authorization always; UI locks are hints only").
 *
 * Next.js 15: `cookies()` is async, so this factory is async too.
 *
 * The `setAll` writes can throw when called from a Server Component (cookies are
 * read-only there). That is expected: middleware (`updateSession`) refreshes the
 * session cookie on every request, so swallowing the write in RSC is safe.
 */
export async function createClient(): Promise<SupabaseClient> {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where cookies are read-only.
          // Middleware refreshes the session cookie, so this is a safe no-op.
        }
      },
    },
  });
}
