import type { Metadata } from 'next';
import { Badge, Disclaimer } from '@fxunlock/ui';
import { PageHeader, TenantIsolationNote } from '../_shell/PageHeader';
import { SAMPLE_TENANT } from '../_shell/nav';

export const metadata: Metadata = {
  title: 'Partner Overview',
};

/**
 * Partner Overview (M20). RSC — the `/partner` layout already enforced the
 * server-side partner-admin gate, so this route is reachable only by a verified
 * partner admin for a single tenant.
 *
 * All numbers below are SAMPLE/STUBBED data for this one tenant. In production
 * each figure comes from an RLS-scoped query (filtered to the partner's
 * `org_id`), never from a global FX Academy aggregate.
 * TODO: read tenant KPIs from the RLS-scoped reporting views.
 */
interface Kpi {
  readonly label: string;
  readonly value: string;
  readonly delta?: string;
}

const KPIS: ReadonlyArray<Kpi> = [
  { label: 'Licensed seats', value: '500', delta: '420 in use' },
  { label: 'Active members (30d)', value: '318', delta: '+24 vs prev' },
  { label: 'Revenue share (MTD)', value: '$8,240', delta: '70% partner split' },
  { label: 'License fee (monthly)', value: '$1,500', delta: 'Growth tier' },
];

interface ChecklistItem {
  readonly title: string;
  readonly description: string;
  readonly done: boolean;
}

const LAUNCH_CHECKLIST: ReadonlyArray<ChecklistItem> = [
  { title: 'Organization details confirmed', description: 'Legal entity, support contact and timezone set.', done: true },
  { title: 'Branding applied', description: 'Logo, favicon and brand colors saved to the tenant theme.', done: true },
  { title: 'Course library configured', description: 'FX Academy curriculum enabled; partner content drafted.', done: true },
  { title: 'Custom domain verified', description: 'Ownership verification + SSL must complete before routing traffic.', done: false },
  { title: 'Team invited', description: 'Owner, admins and educators added under Team Access.', done: false },
  { title: 'Go-live review', description: 'Final checklist sign-off before the academy opens to members.', done: false },
];

export default function PartnerOverviewPage() {
  const tenant = SAMPLE_TENANT;
  const remaining = LAUNCH_CHECKLIST.filter((i) => !i.done).length;

  return (
    <>
      <PageHeader
        title="Partner Overview"
        lead={`A tenant-scoped snapshot of ${tenant.name}: seats, engagement, revenue share and your path to launch.`}
        actions={<Badge tone="outline">Tenant {tenant.orgId}</Badge>}
      />

      <TenantIsolationNote tenantName={tenant.name} />

      <section aria-label="Key metrics" className="pt-kpis">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="pt-kpi">
            <div className="l">{kpi.label}</div>
            <div className="v">{kpi.value}</div>
            {kpi.delta ? <div className="d pos">{kpi.delta}</div> : null}
          </div>
        ))}
      </section>

      <div className="pt-grid-2-wide">
        <section className="pt-panel" aria-labelledby="launch-h">
          <h2 id="launch-h">Launch checklist</h2>
          <p className="sub">
            {remaining === 0
              ? 'All steps complete — your academy is ready to open.'
              : `${remaining} step${remaining === 1 ? '' : 's'} left before you can go live.`}
          </p>
          <ul className="pt-check">
            {LAUNCH_CHECKLIST.map((item) => (
              <li key={item.title}>
                <span className={item.done ? 'mark done' : 'mark todo'} aria-hidden="true">
                  {item.done ? '✓' : ''}
                </span>
                <span>
                  <span className="ttl">{item.title}</span>
                  <p className="desc">{item.description}</p>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="pt-panel" aria-labelledby="licensing-h">
          <h2 id="licensing-h">Licensing &amp; isolation</h2>
          <p className="sub">How this tenant is provisioned and protected.</p>
          <div className="pt-status-row">
            <div>
              <div className="k">License tier</div>
              <div className="meta">Per-seat licensing, billed monthly</div>
            </div>
            <Badge tone="lime-dark">{tenant.plan}</Badge>
          </div>
          <div className="pt-status-row">
            <div>
              <div className="k">Data isolation</div>
              <div className="meta">Postgres RLS on every org-scoped table</div>
            </div>
            <Badge tone="pos">Enforced</Badge>
          </div>
          <div className="pt-status-row">
            <div>
              <div className="k">Custom domain</div>
              <div className="meta">Routing blocked until ownership is verified</div>
            </div>
            <Badge tone="warn">Pending</Badge>
          </div>
          <div className="pt-status-row">
            <div>
              <div className="k">Revenue share</div>
              <div className="meta">Partner split applied at settlement</div>
            </div>
            <Badge tone="outline">70 / 30</Badge>
          </div>
        </section>
      </div>

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </>
  );
}
