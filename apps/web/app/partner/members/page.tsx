import type { Metadata } from 'next';
import { Badge, Disclaimer } from '@fxunlock/ui';
import { PageHeader, TenantIsolationNote } from '../_shell/PageHeader';
import { SAMPLE_TENANT } from '../_shell/nav';
import { InviteBar } from './InviteBar';
import './members.css';

export const metadata: Metadata = {
  title: 'Members',
};

interface Member {
  readonly name: string;
  readonly email: string;
  readonly role: 'Member' | 'Educator' | 'Support';
  readonly engagement: number;
  readonly status: 'Active' | 'Invited' | 'Paused';
}

/**
 * Members (M20). Invite/import members, view engagement, manage roles. The
 * member rows are SAMPLE data scoped to this tenant — in production they come
 * from an RLS-scoped query (filtered to the partner's `org_id`), so a partner
 * never sees another tenant's members. The invite bar is an isolated client leaf.
 * TODO: read members from the RLS-scoped tenant query; wire role mutations.
 */
const MEMBERS: ReadonlyArray<Member> = [
  { name: 'Priya Nair', email: 'priya@meridian.co', role: 'Member', engagement: 86, status: 'Active' },
  { name: 'Daniel Osei', email: 'daniel@meridian.co', role: 'Member', engagement: 64, status: 'Active' },
  { name: 'Lena Hoffmann', email: 'lena@meridian.co', role: 'Educator', engagement: 92, status: 'Active' },
  { name: 'Marcus Webb', email: 'marcus@meridian.co', role: 'Member', engagement: 38, status: 'Paused' },
  { name: 'Aisha Rahman', email: 'aisha@meridian.co', role: 'Support', engagement: 71, status: 'Active' },
  { name: 'Tom Becker', email: 'tom@meridian.co', role: 'Member', engagement: 0, status: 'Invited' },
];

function statusTone(status: Member['status']): 'pos' | 'warn' | 'outline' {
  if (status === 'Active') return 'pos';
  if (status === 'Paused') return 'warn';
  return 'outline';
}

export default function MembersPage() {
  const tenant = SAMPLE_TENANT;
  const active = MEMBERS.filter((m) => m.status === 'Active').length;

  return (
    <>
      <PageHeader
        title="Members"
        lead="Invite or import members, track engagement, and manage roles — all within your tenant."
        actions={<Badge tone="outline">{active} active · {MEMBERS.length} total</Badge>}
      />

      <TenantIsolationNote tenantName={tenant.name} />

      <InviteBar />

      <div className="pt-table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Engagement (30d)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MEMBERS.map((member) => (
              <tr key={member.email}>
                <td>
                  <div className="mbr-name">{member.name}</div>
                  <div className="mbr-email">{member.email}</div>
                </td>
                <td>{member.role}</td>
                <td>
                  <span className="mbr-eng">
                    <span className="bar" aria-hidden="true">
                      <i style={{ width: `${member.engagement}%` }} />
                    </span>
                    <span className="pct">{member.engagement}%</span>
                  </span>
                </td>
                <td>
                  <Badge tone={statusTone(member.status)}>{member.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </>
  );
}
