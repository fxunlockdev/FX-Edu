import type { Metadata } from 'next';
import { Disclaimer } from '@fxunlock/ui';
import { AffiliateShell } from '../_components/AffiliateShell';
import { Sparkline } from '../_components/Sparkline';
import {
  OVERVIEW_METRICS,
  PROJECTED_PAYOUT,
  MRR_TREND,
} from '../_components/sample-data';

export const metadata: Metadata = {
  title: 'Affiliate Overview',
  robots: { index: false, follow: false },
};

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Affiliate Overview (M14 / PROJECT.md §8.18). RSC.
 *
 * Auth + the affiliate role gate are already enforced by the portal layout, so
 * this route is reachable only by an approved affiliate. The KPIs, projected
 * payout and trend are SAMPLE data — there is no affiliate attribution backend
 * wired yet.
 * // TODO: wire affiliate KPIs from the attribution backend (clicks/signups/
 * // trials/paid/active/MRR are aggregated server-side over the referrals ledger).
 */
export default function AffiliateOverviewPage() {
  return (
    <AffiliateShell active="Overview" title="Overview">
      <h1 className="h-md" style={{ margin: 0 }}>
        Your affiliate performance
      </h1>
      <p className="muted aff-lead">
        Clicks, signups and recurring commission across your referral links.
        Figures shown are sample data while attribution is being connected.
      </p>

      <div className="aff-metrics">
        {OVERVIEW_METRICS.map((m) => (
          <div className="aff-metric" key={m.key}>
            <div className="l">{m.label}</div>
            <div className="v num">{m.value}</div>
            {m.delta && <div className={`d ${m.deltaTone ?? 'neutral'}`}>{m.delta}</div>}
            {m.hint && !m.delta && <div className="d neutral">{m.hint}</div>}
          </div>
        ))}
      </div>

      <section className="aff-payout-hero">
        <div className="glow glow-lime" aria-hidden="true" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="lbl">{PROJECTED_PAYOUT.label}</div>
          <div className="amount num">{usd(PROJECTED_PAYOUT.amountUsd)}</div>
        </div>
        <p className="note">{PROJECTED_PAYOUT.note}</p>
      </section>

      <div className="aff-trend">
        <p className="ph">Referred MRR trend</p>
        <p className="sub">Gross recurring subscription value from your active referrals (sample).</p>
        <Sparkline data={MRR_TREND} label="Referred monthly recurring revenue trend, rising over the period" />
      </div>

      <Disclaimer kind="custom" variant="callout" style={{ marginTop: 24 }}>
        Earnings are not guaranteed. Commission is earned only on completed,
        non-refunded subscription payments and may be reduced by refunds and
        chargebacks. All figures above are illustrative sample data.
      </Disclaimer>
      <Disclaimer kind="risk" variant="note" style={{ marginTop: 16 }} />
    </AffiliateShell>
  );
}
