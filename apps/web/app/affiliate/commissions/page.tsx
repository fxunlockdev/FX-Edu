import type { Metadata } from 'next';
import { Badge, Disclaimer } from '@fxunlock/ui';
import { AffiliateShell } from '../_components/AffiliateShell';
import {
  COMMISSION_TERMS,
  COMMISSION_ROWS,
  type CommissionRow,
} from '../_components/sample-data';

export const metadata: Metadata = {
  title: 'Commissions',
  robots: { index: false, follow: false },
};

const usd = (n: number) =>
  `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

function statusLabel(row: CommissionRow): string {
  if (row.adjustment === 'refund') return 'Refund';
  if (row.adjustment === 'chargeback') return 'Chargeback';
  return row.status.charAt(0).toUpperCase() + row.status.slice(1);
}

/**
 * Commissions (M14 / PROJECT.md §8.18). RSC.
 *
 * Shows the program terms (single source of truth in `COMMISSION_TERMS`) and a
 * SAMPLE commissions ledger that includes refund and chargeback adjustment rows
 * (negative commission) — so the page demonstrates that earned commission is
 * reversed when a referred payment is refunded or charged back.
 * // TODO: wire commissions ledger from the attribution/billing backend
 * // (recurring accrual on completed payments; signed reversals on refunds/CBs).
 */
export default function CommissionsPage() {
  const { basicRatePct, proRatePct, cookieWindowDays, basicPlanPriceUsd, proPlanPriceUsd } =
    COMMISSION_TERMS;

  return (
    <AffiliateShell active="Commissions" title="Commissions">
      <h1 className="h-md" style={{ margin: 0 }}>
        Commission terms &amp; ledger
      </h1>
      <p className="muted aff-lead">
        Recurring commission on every active referral, with transparent
        adjustments when a payment is refunded or charged back.
      </p>

      <div className="aff-terms">
        <div>
          <div className="eyebrow">Basic referral</div>
          <div className="rate">{basicRatePct}%</div>
          <p className="muted">Recurring on ${basicPlanPriceUsd}/mo subscriptions.</p>
        </div>
        <div>
          <div className="eyebrow" style={{ color: 'var(--primary)' }}>
            Pro referral
          </div>
          <div className="rate pro">{proRatePct}%</div>
          <p className="muted">Recurring on ${proPlanPriceUsd}/mo subscriptions.</p>
        </div>
        <div>
          <div className="eyebrow">Cookie window</div>
          <div className="rate">{cookieWindowDays}d</div>
          <p className="muted">Last-touch attribution, tracked server-side.</p>
        </div>
      </div>

      <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
        Attribution is <strong>last-touch</strong> within a{' '}
        <strong>{cookieWindowDays}-day</strong> cookie window and is recorded
        server-side. Commission accrues only on completed, non-refunded payments;
        refunds and chargebacks reverse the corresponding commission.
      </p>

      <section className="aff-section">
        <h2>Recent commission activity</h2>
        <p className="sub muted">Sample ledger including refund / chargeback adjustments.</p>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Referral</th>
                <th scope="col">Plan</th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Gross
                </th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Rate
                </th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Commission
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {COMMISSION_ROWS.map((row) => {
                const isReversal = row.commissionUsd < 0;
                return (
                  <tr key={row.id}>
                    <td className="aff-num">{fmtDate(row.date)}</td>
                    <td>{row.referral}</td>
                    <td>{row.plan}</td>
                    <td className="aff-num" style={{ textAlign: 'right' }}>
                      {usd(row.grossUsd)}
                    </td>
                    <td className="aff-num" style={{ textAlign: 'right' }}>
                      {row.ratePct}%
                    </td>
                    <td
                      className={`aff-num ${isReversal ? 'neg' : 'pos'}`}
                      style={{ textAlign: 'right', fontWeight: 700 }}
                    >
                      {usd(row.commissionUsd)}
                    </td>
                    <td>
                      <Badge
                        tone={
                          row.status === 'reversed'
                            ? 'neg'
                            : row.status === 'paid'
                              ? 'pos'
                              : row.status === 'approved'
                                ? 'forest'
                                : 'warn'
                        }
                      >
                        {statusLabel(row)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Disclaimer kind="custom" variant="callout" style={{ marginTop: 24 }}>
        Earnings are not guaranteed and depend on the subscriptions your
        referrals maintain. Commission already credited is reversed if the
        underlying payment is refunded or charged back. All ledger rows above are
        illustrative sample data.
      </Disclaimer>
    </AffiliateShell>
  );
}
