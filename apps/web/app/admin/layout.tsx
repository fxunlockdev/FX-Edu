import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { requireAdmin } from './_lib/require-admin';
import { AdminSidebar } from './_components/AdminSidebar';
import { AdminTopbar } from './_components/AdminTopbar';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Admin Console', template: '%s · FX Academy Admin' },
  // The console must never be indexed.
  robots: { index: false, follow: false },
};

/**
 * Admin shell layout (F7) for the real `/admin/*` route SEGMENT — deliberately a
 * plain folder, not a route group, so URLs are `/admin/...` (PROJECT.md §9
 * module 19). Every admin page nests under this layout.
 *
 * The auth + role gate is SERVER-SIDE and runs once per request here, before any
 * admin UI renders. `requireAdmin()` is default-DENY: no session, a failed
 * lookup, or a non-admin role all redirect out (to /login or /admin/forbidden).
 * The UI is never trusted for this decision (ENGINEERING.md "Server-side
 * authorization always; UI locks are hints only"; PROJECT.md §6.1).
 *
 * 🔒 Beyond this gate, the console operates under two standing rules that the
 * UI surfaces everywhere and the backend must enforce:
 *   • Every admin mutation writes an audit log — `actor, action, target,
 *     metadata, IP, UA, ts` (§6.7). All mutations below are no-op stubs that
 *     funnel through `auditStub` to make that contract explicit.
 *   • Dangerous actions (suspend/ban/impersonate/GDPR delete/refund/publish/role
 *     change) require STEP-UP (fresh MFA) + a reason note (§6.1 / §6.7).
 *
 * // TODO §6.1: enforce admin MFA + step-up freshness inside `requireAdmin`.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="adm">
      <AdminSidebar />
      <div className="adm-main">
        <AdminTopbar email={admin.email} role={admin.role} />
        <main className="adm-body" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
