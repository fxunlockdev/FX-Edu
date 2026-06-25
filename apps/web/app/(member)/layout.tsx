import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Protected `(member)` route group layout. The auth gate is SERVER-SIDE: we read
 * the session from the server client and redirect unauthenticated visitors to
 * /login (carrying a return path). UI is never trusted for this decision —
 * PROJECT.md §6.1 ("Server-side authorization always; UI locks are hints only").
 *
 * Every member route nests under this layout, so the gate runs once per request
 * for the whole group. Per-feature entitlement checks (Basic vs Pro) layer on
 * top of this in later modules.
 */
export default async function MemberLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  return <>{children}</>;
}
