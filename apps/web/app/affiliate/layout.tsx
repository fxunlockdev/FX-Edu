import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasAffiliateRole, type AffiliateRoleClaims } from './_components/nav';
import './affiliate.css';

export const metadata: Metadata = {
  // The portal is private — never index any affiliate route.
  robots: { index: false, follow: false },
};

/**
 * Affiliate portal layout (M14 / PROJECT.md §8.18, §6.1).
 *
 * Two server-side gates, **default DENY**, run once per request for the whole
 * `/affiliate/*` segment:
 *
 *   1. **Auth** — read the session from the server Supabase client; an
 *      unauthenticated visitor is redirected to /login with a return path.
 *   2. **Role / membership** — the caller must hold the `affiliate` role (or an
 *      approved `affiliates` row). UI is never trusted for this decision; the
 *      sidebar lock states are hints only (§6.1). No affiliate role source is
 *      runtime-wired yet, so {@link hasAffiliateRole} returns `false` for
 *      everyone and we redirect to the public affiliate landing. When the JWT
 *      claim lands, that single predicate flips and the portal unlocks.
 *
 * // TODO: read affiliate role/membership from JWT/profile and feed it to
 * // hasAffiliateRole() (claims.role === 'affiliate' or approved affiliates row).
 */
export default async function AffiliateLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/affiliate/overview');
  }

  // TODO: replace with verified JWT claims / approved affiliates row.
  const claims: AffiliateRoleClaims | null = null;
  if (!hasAffiliateRole(claims)) {
    // Default DENY → bounce non-affiliates to the public program landing page.
    redirect('/affiliates');
  }

  return <>{children}</>;
}
