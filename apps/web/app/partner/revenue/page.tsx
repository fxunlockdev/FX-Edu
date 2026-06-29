import type { Metadata } from 'next';
import { Badge, Disclaimer } from '@fxunlock/ui';
import { PageHeader, TenantIsolationNote } from '../_shell/PageHeader';
import { SAMPLE_TENANT } from '../_shell/nav';
import './revenue.css';

export const metadata: Metadata = {
  title: 'Revenue / Licensing',
};

interface Invoice {
  readonly id: string;
  readonly period: string;
  readonly seats: number;
  readonly amount: string;
  readonly status: 'Paid' | 'Due' | 'Processing';
}

/**
 * Revenue / Licensing (M20). Seats, active members, license fees, revenue share
 * and invoices — all SAMPLE data scoped to this tenant. In production every
 * figure comes from RLS-scoped billing views (the partner's `org_id` only), so
 * one partner can never see another's financials.
 * TODO: read licensing + invoices from the RLS-scoped billing views.
 */
const KPIS = [
  { label: 'Licensed seats', value: '500' },
  { label: 'Active members (30d)', value: '318' },
  { label: 'License fee (monthly)', value: '$1,500' },
  { label: 'Revenue share (MTD)', value: '$8,240' },
] as const;

const INVOICES: ReadonlyArray<Invoice> = [
  { id: 'INV-2026-06', period: 'Jun 2026', seats: 500, amount: '$1,500.00', status: 'Due' },
  { id: 'INV-2026-05', period: 'May 2026', seats: 500, amount: '$1,500.00', status: 'Paid' },
  { id: 'INV-2026-04', period: 'Apr 2026', seats: 450, amount: '$1,350.00', status: 'Paid' },
  { id: 'INV-2026-03', period: 'Mar 2026', seats: 450, amount: '$1,350.00', status: 'Paid' },
];

function invoiceTone(status: Invoice['status']): 'pos' | 'warn' | 'outline' {
  if (status === 'Paid') return 'pos';
  if (status === 'Due') return 'warn';
  return 'outline';
}

export default function RevenuePage() {
  const tenant = SAMPLE_TENANT;

  return (
    <>
      <PageHeader
        title="Revenue / Licensing"
        lead="Seats, active members, license fees, revenue share and invoices — scoped to your tenant."
        actions={<Badge tone="lime-dark">{tenant.plan} tier</Badge>}
      />

      <TenantIsolationNote tenantName={tenant.name} />

      <section aria-label="Licensing metrics" className="pt-kpis">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="pt-kpi">
            <div className="l">{kpi.label}</div>
            <div className="v">{kpi.value}</div>
          </div>
        ))}
      </section>

      <div className="pt-grid-2">
        <section className="pt-panel" aria-labelledby="split-h">
          <h2 id="split-h">Revenue share</h2>
          <p className="sub">Applied at settlement on member subscription revenue.</p>
          <div className="rev-split">
            <div className="seg">
              <div className="pct">70%</div>
              <div className="who">Partner ({tenant.name})</div>
            </div>
            <div className="seg">
              <div className="pct">30%</div>
              <div className="who">FX Academy platform</div>
            </div>
          </div>
        </section>

        <section className="pt-panel" aria-labelledby="license-h">
          <h2 id="license-h">License terms</h2>
          <p className="sub">Per-seat licensing billed monthly.</p>
          <div className="pt-status-row">
            <div className="k">Seats licensed</div>
            <span className="rev-amount">500</span>
          </div>
          <div className="pt-status-row">
            <div className="k">Seats in use</div>
            <span className="rev-amount">420</span>
          </div>
          <div className="pt-status-row">
            <div className="k">Price per seat</div>
            <span className="rev-amount">$3.00 / mo</span>
          </div>
          <div className="pt-status-row">
            <div className="k">Next invoice</div>
            <Badge tone="warn">Jun 2026 · due</Badge>
          </div>
        </section>
      </div>

      <section className="pt-panel" aria-labelledby="inv-h" style={{ marginTop: 20 }}>
        <h2 id="inv-h">Invoices</h2>
        <p className="sub">Your tenant&rsquo;s billing history.</p>
        <div className="pt-table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Period</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id}>
                  <td><code>{inv.id}</code></td>
                  <td>{inv.period}</td>
                  <td className="num">{inv.seats}</td>
                  <td className="rev-amount">{inv.amount}</td>
                  <td>
                    <Badge tone={invoiceTone(inv.status)}>{inv.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </>
  );
}
