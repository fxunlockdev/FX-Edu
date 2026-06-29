import type { Metadata } from 'next';
import { PageHeader, AuditBanner, AuditNote } from '../_components';
import { FeatureFlags } from './FeatureFlags';
import { SAMPLE_ROLES, SAMPLE_AUDIT_LOG, SAMPLE_DISCLOSURES } from './settings-data';

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
};

/**
 * Admin Settings (M19 / PROJECT.md §9 module 19 "Settings"). RSC page showing
 * roles/permissions, a read-only audit-log view, feature flags (toggle stubs in
 * the `FeatureFlags` client leaf), and disclosure versions — all sample data.
 *
 * The audit log here is the visible surface of `GET /admin/audit-logs` (§9
 * module 19 Key APIs). Role changes + flag toggles are dangerous (step-up +
 * reason, §6.1 / §6.7).
 */
export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Roles, permissions, the audit log, feature flags and legal disclosures. Sample data; toggles are stubs."
      />

      <AuditBanner />

      <div className="adm-grid-2">
        <section className="adm-panel" aria-labelledby="roles-h">
          <div className="adm-panel-head">
            <h2 id="roles-h">Roles &amp; permissions</h2>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table" style={{ minWidth: 0 }}>
              <thead>
                <tr>
                  <th scope="col">Role</th>
                  <th scope="col">Permissions</th>
                  <th scope="col">MFA</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_ROLES.map((row) => (
                  <tr key={row.role}>
                    <td className="adm-cell-strong">{row.role}</td>
                    <td className="adm-cell-muted">{row.permissions}</td>
                    <td>{row.mfa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AuditNote danger>
            Changing a role grants or revokes privileged access — step-up MFA + a reason note are required (§6.1).
          </AuditNote>
        </section>

        <section className="adm-panel" aria-labelledby="flags-h">
          <div className="adm-panel-head">
            <h2 id="flags-h">Feature flags</h2>
          </div>
          <FeatureFlags />
        </section>
      </div>

      <section className="adm-panel" aria-labelledby="audit-h">
        <div className="adm-panel-head">
          <h2 id="audit-h">Audit log</h2>
          <p className="adm-panel-sub">Read-only · served by GET /admin/audit-logs</p>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Timestamp</th>
                <th scope="col">Actor</th>
                <th scope="col">Action</th>
                <th scope="col">Target</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_AUDIT_LOG.map((row) => (
                <tr key={`${row.ts}-${row.action}-${row.target}`}>
                  <td className="adm-num">{row.ts}</td>
                  <td className="adm-cell-muted">{row.actor}</td>
                  <td className="adm-cell-strong">{row.action}</td>
                  <td className="adm-num">{row.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AuditNote>
          The audit trail is append-only. On GDPR erasure the actor is pseudonymized, not deleted, so the
          trail survives without holding PII (§6.8).
        </AuditNote>
      </section>

      <section className="adm-panel" aria-labelledby="disclosures-h">
        <div className="adm-panel-head">
          <h2 id="disclosures-h">Disclosures</h2>
        </div>
        <dl className="adm-deflist">
          {SAMPLE_DISCLOSURES.map((row) => (
            <div key={row.surface}>
              <dt>{row.surface}</dt>
              <dd>{row.status}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
