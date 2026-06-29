import type { Metadata } from 'next';
import { Badge, Disclaimer } from '@fxunlock/ui';
import { AffiliateShell } from '../_components/AffiliateShell';
import {
  PAYOUT_BALANCE,
  PAYOUT_HISTORY,
  COMMISSION_TERMS,
} from '../_components/sample-data';

export const metadata: Metadata = {
  title: 'Payouts',
  robots: { index: false, follow: false },
};

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

/**
 * Payouts (M14 / PROJECT.md §8.18). RSC.
 *
 * Stripe Connect onboarding, KYC and payouts are **STUBBED** — there is no
 * Stripe SDK/dependency here and no secrets. We render the designed balance
 * cards (pending / available / lifetime paid) and a sample payout history, but
 * the onboarding action is a placeholder and payouts are **blocked until KYC and
 * the affiliate disclosure are complete**.
 * // TODO: wire Stripe Connect — Express onboarding, KYC/identity verification,
 * // account status webhooks, and the available→paid transfer flow.
 */
export default function PayoutsPage() {
  // Gate state (stubbed). Both must be true before a payout can be requested.
  // TODO: read real KYC + disclosure status from Stripe Connect + the affiliate row.
  const kycComplete = false;
  const disclosureComplete = false;
  const payoutsUnlocked = kycComplete && disclosureComplete;

  return (
    <AffiliateShell active="Payouts" title="Payouts">
      <h1 className="h-md" style={{ margin: 0 }}>
        Payouts &amp; Stripe Connect
      </h1>
      <p className="muted aff-lead">
        Earned commission is paid out via Stripe Connect once your account is
        verified. Balances below are sample data.
      </p>

      <div className="aff-balance">
        <div className="aff-metric">
          <div className="l">Pending</div>
          <div className="v num">{usd(PAYOUT_BALANCE.pendingUsd)}</div>
          <div className="d neutral">Accruing, not yet available</div>
        </div>
        <div className="aff-metric">
          <div className="l">Available</div>
          <div className="v num">{usd(PAYOUT_BALANCE.availableUsd)}</div>
          <div className="d neutral">
            Min. payout {usd(COMMISSION_TERMS.payoutMinimumUsd)}
          </div>
        </div>
        <div className="aff-metric">
          <div className="l">Lifetime paid</div>
          <div className="v num">{usd(PAYOUT_BALANCE.lifetimePaidUsd)}</div>
          <div className="d pos">Across all payouts</div>
        </div>
      </div>

      <section className="aff-section">
        <h2>Connect account status</h2>
        <p className="sub muted">Identity verification (KYC) is handled by Stripe.</p>
        <div className="aff-stub" role="status">
          <h3>Stripe Connect onboarding coming soon</h3>
          <p>
            Connect onboarding and KYC are not yet available. When it ships, you
            will complete a short Stripe-hosted identity check, and your account
            status (pending / available / paid) will update here automatically.
          </p>
          <div className="row gap2" style={{ marginTop: 14, flexWrap: 'wrap' }}>
            <span className="aff-pill pending">
              KYC: {kycComplete ? 'Complete' : 'Not started'}
            </span>
            <span className={`aff-pill ${disclosureComplete ? 'paid' : 'pending'}`}>
              Disclosure: {disclosureComplete ? 'Accepted' : 'Required'}
            </span>
            <button type="button" className="btn btn-forest btn-sm" disabled aria-disabled="true">
              Connect Stripe (coming soon)
            </button>
          </div>
        </div>

        {!payoutsUnlocked && (
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            <strong>Payouts are blocked</strong> until both KYC (identity
            verification) and the affiliate disclosure acknowledgement are
            complete. Finish the disclosure on the{' '}
            <a href="/affiliate/settings" className="text-lime">
              Settings
            </a>{' '}
            page and complete Stripe onboarding once it is available.
          </p>
        )}
      </section>

      <section className="aff-section">
        <h2>Payout history</h2>
        <p className="sub muted">Sample history — populated from Stripe transfers once wired.</p>
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Method</th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Amount
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {PAYOUT_HISTORY.map((row) => (
                <tr key={row.id}>
                  <td className="aff-num">{fmtDate(row.date)}</td>
                  <td>{row.method}</td>
                  <td className="aff-num" style={{ textAlign: 'right', fontWeight: 700 }}>
                    {usd(row.amountUsd)}
                  </td>
                  <td>
                    <Badge tone={row.status === 'paid' ? 'pos' : 'warn'}>
                      {row.status === 'in_transit' ? 'In transit' : row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Disclaimer kind="custom" variant="callout" style={{ marginTop: 24 }}>
        Payouts require completed identity verification (KYC) and an accepted
        affiliate disclosure. Earnings are not guaranteed; available balances can
        decrease if referred payments are refunded or charged back before payout.
      </Disclaimer>
    </AffiliateShell>
  );
}
