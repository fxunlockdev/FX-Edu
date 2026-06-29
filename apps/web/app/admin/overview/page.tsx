import type { Metadata } from 'next';
import { Disclaimer } from '@fxunlock/ui';
import { PageHeader, AuditBanner } from '../_components';
import { OVERVIEW_KPIS } from './kpi-data';

export const metadata: Metadata = {
  title: 'Overview',
  robots: { index: false, follow: false },
};

/**
 * Admin Overview (M19 / PROJECT.md §9 module 19 "Overview KPIs"). RSC: renders
 * the eight headline KPIs from STUBBED sample data — members, MRR, churn, active
 * learners, webinar attendance, AI usage, community reports, failed payments.
 *
 * Access is already gated by the admin layout (`requireAdmin`). These are reads
 * only; once wired, even reads are access-audited and hit analytics replicas
 * with cached aggregates (§9 module 19 📈 / §6.7).
 */
export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Operational health at a glance. All figures below are sample data pending the analytics wiring."
      />

      <AuditBanner />

      <section aria-label="Key performance indicators" className="adm-kpi-grid">
        {OVERVIEW_KPIS.map((kpi) => (
          <article key={kpi.label} className={`adm-kpi${kpi.alert ? ' alert' : ''}`}>
            <span className="adm-kpi-label">{kpi.label}</span>
            <span className="adm-kpi-value">{kpi.value}</span>
            {kpi.delta ? (
              <span className={`adm-kpi-delta ${kpi.trend}`}>{kpi.delta}</span>
            ) : null}
          </article>
        ))}
      </section>

      <Disclaimer kind="custom" variant="callout" style={{ marginTop: 8 }}>
        Sample data shown for layout only. Live KPIs come from{' '}
        <code>GET /admin/overview</code> (cached aggregates off the read replica). Reads in the
        console are access-audited per §6.7.
      </Disclaimer>
    </>
  );
}
