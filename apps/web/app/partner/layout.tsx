import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PartnerSidebar } from './_shell/PartnerSidebar';
import { PartnerTopbar } from './_shell/PartnerTopbar';
import { SAMPLE_TENANT, type PartnerTenant } from './_shell/nav';
import './partner.css';

export const metadata: Metadata = {
  title: {
    default: 'Partner Portal',
    template: '%s · Partner Portal',
  },
  robots: { index: false, follow: false },
};

/**
 * Partner role gate. Mirrors the structure of the partner-admin claim that the
 * session JWT will carry, but resolves DEFENSIVELY: there is no partner-admin
 * role wired at runtime yet, so this returns `null` and the layout DENIES by
 * default (redirect). Flipping a single function makes the portal live — the
 * gate shape never changes.
 *
 * TODO: read partner-admin role + org/tenant from JWT/profile
 *   const { data: { user } } = await supabase.auth.getUser();
 *   const role  = user?.app_metadata?.role;          // 'partner_admin'
 *   const orgId = user?.app_metadata?.org_id;        // tenant id (RLS claim)
 *   if (role !== 'partner_admin' || !orgId) return null;
 *   return loadTenant(orgId);                         // RLS-scoped read
 */
async function resolvePartnerTenant(): Promise<PartnerTenant | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // First gate: must be authenticated at all.
  if (!user) return null;

  // Second gate: must hold the partner-admin role for a specific tenant.
  // Default DENY until the role + org_id claim is wired from the JWT.
  // TODO: read partner-admin role + org/tenant from JWT/profile
  const hasPartnerAdminClaim = false;
  if (!hasPartnerAdminClaim) return null;

  // When wired, the tenant is loaded through the RLS-scoped server client so a
  // partner admin can only ever read their OWN org's row — never another
  // tenant's, and never global FX Academy admin data.
  return SAMPLE_TENANT;
}

/**
 * White-Label Partner Portal layout (M20). Every `/partner/*` route nests here,
 * so the SERVER-SIDE role gate runs once per request for the whole segment —
 * UI is never trusted for this decision (PROJECT.md §6.1; ENGINEERING.md
 * "Server-side authorization always").
 *
 * TENANT ISOLATION (read this before adding any query): every partner-scoped
 * table carries `org_id`, and Postgres RLS policies read `auth.jwt() -> org_id`
 * natively. As a result, EVERY query the portal makes is automatically scoped to
 * the signed-in partner's tenant — a partner admin CANNOT read another tenant's
 * data, and CANNOT reach the global FX Academy admin surface. The gate here
 * authenticates the human; RLS isolates the data. The pages below render
 * sample/stubbed tenant data only.
 */
export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const tenant = await resolvePartnerTenant();

  // Default DENY: anyone without a verified partner-admin claim is redirected.
  if (!tenant) {
    redirect('/login?redirect=/partner/overview');
  }

  return (
    <div className="pt-shell">
      <PartnerSidebar tenant={tenant} />
      <div className="pt-main">
        <PartnerTopbar tenant={tenant} />
        <main className="pt-body" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
