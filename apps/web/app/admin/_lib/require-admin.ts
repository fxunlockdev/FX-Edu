import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * The privileged roles permitted into the Admin Console (PROJECT.md §6.1).
 * Membership here is NEVER the whole story — MFA + step-up are enforced on top
 * (see `requireAdmin` notes). Kept as a readonly tuple so the set is immutable.
 */
export const ADMIN_ROLES = ['admin', 'super_admin'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/** Minimal shape of the authenticated admin the shell needs to render. */
export interface AdminIdentity {
  id: string;
  email: string;
  /** Effective role, once JWT-claim reading is wired (see TODO below). */
  role: AdminRole;
}

/**
 * SERVER-SIDE admin role gate for the `/admin/*` segment. This is the single
 * authoritative authorization check for the whole console — the UI is never
 * trusted (PROJECT.md §6.1 "Two-layer authorization"; ENGINEERING.md
 * "Server-side authorization always; UI locks are hints only").
 *
 * Posture is DEFAULT-DENY: we only return an identity when we can positively
 * establish (a) an authenticated user AND (b) an admin role. Anything else —
 * no session, a thrown lookup, an unrecognized role — redirects out. We never
 * "fail open".
 *
 * Not yet wired (stubbed deny-by-default until the auth/RBAC backend lands):
 *  - // TODO §6.1: read `role` from the Supabase session JWT custom-claims hook
 *    (`auth.jwt()->>'role'`) instead of trusting any client-supplied value.
 *  - // TODO §6.1: enforce MFA for the admin role and STEP-UP (fresh MFA) before
 *    rendering — and re-challenge per-action for dangerous mutations.
 *  - // TODO §6.7: every privileged read/mutation in this segment must emit an
 *    audit-log row (`actor, action, target, metadata, IP, UA, ts`).
 *
 * @param redirectTo where to send unauthenticated callers (login by default).
 */
export async function requireAdmin(redirectTo = '/login?redirect=/admin/overview'): Promise<AdminIdentity> {
  const supabase = await createClient();

  // Defensive: never let a thrown lookup become an accidental allow.
  let user: { id: string; email: string } | null = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser ? { id: authUser.id, email: authUser.email ?? '' } : null;
  } catch {
    // Treat any auth error as "not authenticated" → deny.
    user = null;
  }

  if (!user) {
    redirect(redirectTo);
  }

  // TODO §6.1: replace this stub with the real JWT-claim role. Until the RBAC
  // backend is wired we DENY everyone (default-deny). We redirect an
  // authenticated-but-unauthorized caller back to /login carrying a
  // `forbidden` reason rather than into a gated 403 page (which lives under
  // this same layout and would loop). The console never leaks to non-admins.
  const role = readAdminRoleStub(user.id);

  if (!role) {
    redirect('/login?reason=admin_forbidden&redirect=/admin/overview');
  }

  // TODO §6.1: assert MFA satisfied + step-up freshness here before returning.

  return { id: user.id, email: user.email, role };
}

/**
 * STUB role resolver. Returns `null` for everyone (default-deny) because no role
 * claim is available yet. Replaced wholesale once §6.1 custom claims are live.
 *
 * NOTE: in local/dev bring-up an allowlist could be threaded here, but we do NOT
 * ship a hardcoded backdoor — the production resolver must read the signed JWT.
 */
function readAdminRoleStub(_userId: string): AdminRole | null {
  // TODO §6.1: return the verified role from the session JWT claims.
  return null;
}
