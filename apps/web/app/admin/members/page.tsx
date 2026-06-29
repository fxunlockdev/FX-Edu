import type { Metadata } from 'next';
import { PageHeader, AuditBanner, AuditNote } from '../_components';
import { MembersTable } from './MembersTable';

export const metadata: Metadata = {
  title: 'Members',
  robots: { index: false, follow: false },
};

/**
 * Admin Members (M19 / PROJECT.md §9 module 19 "Members"). RSC page wrapping the
 * interactive `MembersTable` client leaf. Provides search + view/suspend/ban,
 * GDPR export/delete, and impersonate controls — ALL no-op stubs today.
 *
 * 🔒 Every action is audited (§6.7). Suspend, ban, GDPR export/delete, and
 * impersonate are dangerous → step-up MFA + reason note (§6.1). Impersonation is
 * limited-scope and explicitly logged (§9 module 19), so an operator can never
 * silently act as a member.
 */
export default function AdminMembersPage() {
  return (
    <>
      <PageHeader
        title="Members"
        description="Search the member base and run account actions. All rows are sample data; every action is a stub."
      />

      <AuditBanner />

      <MembersTable />

      <AuditNote danger>
        Impersonation grants a limited-scope, time-boxed session and is logged in full (actor,
        target, scope, reason). It always requires step-up MFA and a written reason.
      </AuditNote>
    </>
  );
}
