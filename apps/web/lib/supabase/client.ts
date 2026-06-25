'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from './env';

/**
 * Browser Supabase client (per @supabase/ssr App Router guidance). Used by the
 * `'use client'` auth/onboarding form leaves. `createBrowserClient` is safe to
 * call on every render — the SDK memoizes a singleton keyed by URL + key — so
 * components can call this freely without a module-level singleton.
 *
 * The session is stored in cookies (not localStorage) so the server client and
 * middleware can read the same session — that is what keeps RSC route guards in
 * sync with what the browser believes.
 */
export function createClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
