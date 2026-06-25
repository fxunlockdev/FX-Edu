'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Sign-out server action. Clears the Supabase session server-side and redirects
 * home. Bound to a `<form action={signOut}>` so it works without client JS and
 * is a real POST (no accidental sign-out via prefetch).
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
