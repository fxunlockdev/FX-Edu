import type { Metadata } from 'next';
import { Disclaimer } from '@fxunlock/ui';
import { PageHeader, AuditBanner, AuditNote } from '../_components';
import { InvoicesTable } from './InvoicesTable';
import { REVENUE_STATS, SAMPLE_COUPONS } from './revenue-data';

export const metadata: Metadata = {
  title: 'Revenue',
  robots: { index: false, follow: false },
};

/**
 * Admin Revenue (M19 / PROJECT.md §9 module 19 "Revenue"). RSC page showing
 * sample subscription/revenue stats, an invoices table (with refund/retry stubs
 * in the `InvoicesTable` client leaf), and a coupons panel.
 *
 * Stripe webhooks are the source of truth in production (§6.2). Refunds are a
 * dangerous mutation: step-up MFA + reason note (§6.1); every mutation audited
 * (§6.7). All controls are no-op stubs.
 */
export default function AdminRevenuePage() {
  return (
    <>
      <PageHeader
        title="Revenue"
        description="Subscriptions, invoices, refunds, failed payments and coupons. Sample data; mutations are stubs."
      />

      <AuditBanner />

      <section aria-label="Revenue summary" className="adm-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {REVENUE_STATS.map((stat) => (
          <article key={stat.label} className="adm-kpi">
            <span className="adm-kpi-label">{stat.label}</span>
            <span className="adm-kpi-value">{stat.value}</span>
          </article>
        ))}
      </section>

      <section className="adm-panel" aria-labelledby="invoices-h">
        <div className="adm-panel-head">
          <h2 id="invoices-h">Invoices &amp; payments</h2>
          <p className="adm-panel-sub">Most recent (sample)</p>
        </div>
        <InvoicesTable />
        <AuditNote danger>
          Refunds require step-up MFA and a written reason, and are idempotent against Stripe (§6.2 / §6.6).
        </AuditNote>
      </section>

      <section className="adm-panel" aria-labelledby="coupons-h">
        <div className="adm-panel-head">
          <h2 id="coupons-h">Coupons</h2>
          <p className="adm-panel-sub">{SAMPLE_COUPONS.length} active (sample)</p>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table" style={{ minWidth: 0 }}>
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Discount</th>
                <th scope="col">Redemptions</th>
                <th scope="col">Expires</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_COUPONS.map((coupon) => (
                <tr key={coupon.code}>
                  <td className="adm-cell-strong">{coupon.code}</td>
                  <td>{coupon.discount}</td>
                  <td className="adm-num">{coupon.redemptions}</td>
                  <td className="adm-num">{coupon.expires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Disclaimer kind="custom" variant="note" style={{ marginTop: 8 }}>
        Figures are sample data for layout only. Production revenue reconciles against Stripe nightly (§6.2).
      </Disclaimer>
    </>
  );
}
