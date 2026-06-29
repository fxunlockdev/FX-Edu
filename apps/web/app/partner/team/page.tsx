import type { Metadata } from 'next';
import { Badge, Button, Disclaimer } from '@fxunlock/ui';
import { PageHeader, TenantIsolationNote } from '../_shell/PageHeader';
import { SAMPLE_TENANT } from '../_shell/nav';

export const metadata: Metadata = {
  title: 'Team Access',
};

interface TeamMember {
  readonly name: string;
  readonly email: string;
  readonly role: 'Owner' | 'Admin' | 'Educator' | 'Support';
}

interface RoleDef {
  readonly role: TeamMember['role'];
  readonly summary: string;
}

/**
 * Team Access (M20). Partner owner / admin / educator / support roles — sample
 * data scoped to this tenant. Roles are tenant-scoped: every team member is a
 * row carrying this tenant's `org_id`, so RLS keeps team management isolated to
 * the partner's own organization (and away from global FX Academy admin).
 * TODO: read team + role grants from the RLS-scoped tenant query; wire mutations.
 */
const ROLE_DEFS: ReadonlyArray<RoleDef> = [
  { role: 'Owner', summary: 'Full control: billing, domain, branding, team and content.' },
  { role: 'Admin', summary: 'Manage members, content and settings — no billing/owner transfer.' },
  { role: 'Educator', summary: 'Author and publish courses; view member engagement.' },
  { role: 'Support', summary: 'View members and respond to support requests; read-only on content.' },
];

const TEAM: ReadonlyArray<TeamMember> = [
  { name: 'Sofia Marin', email: 'sofia@meridian.co', role: 'Owner' },
  { name: 'Lena Hoffmann', email: 'lena@meridian.co', role: 'Admin' },
  { name: 'David Cho', email: 'david@meridian.co', role: 'Educator' },
  { name: 'Aisha Rahman', email: 'aisha@meridian.co', role: 'Support' },
];

function roleTone(role: TeamMember['role']): 'forest' | 'lime-dark' | 'neutral' | 'outline' {
  if (role === 'Owner') return 'forest';
  if (role === 'Admin') return 'lime-dark';
  if (role === 'Educator') return 'neutral';
  return 'outline';
}

export default function TeamPage() {
  const tenant = SAMPLE_TENANT;

  return (
    <>
      <PageHeader
        title="Team Access"
        lead="Owner, admin, educator and support roles for your staff. Access is scoped to your tenant."
        actions={
          <Button variant="lime" size="sm" disabled>
            Add teammate (coming soon)
          </Button>
        }
      />

      <TenantIsolationNote tenantName={tenant.name} />

      <section className="pt-panel" aria-labelledby="roles-h" style={{ marginBottom: 20 }}>
        <h2 id="roles-h">Role definitions</h2>
        <p className="sub">What each role can do inside your partner workspace.</p>
        <dl className="pt-defs">
          {ROLE_DEFS.map((def) => (
            <div className="pt-def" key={def.role}>
              <dt>
                <Badge tone={roleTone(def.role)}>{def.role}</Badge>
              </dt>
              <dd className="muted">{def.summary}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="pt-table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Teammate</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map((member) => (
              <tr key={member.email}>
                <td className="mbr-name" style={{ fontWeight: 600 }}>
                  {member.name}
                </td>
                <td className="muted">{member.email}</td>
                <td>
                  <Badge tone={roleTone(member.role)}>{member.role}</Badge>
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
