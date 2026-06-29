import type { Metadata } from 'next';
import { Disclaimer } from '@fxunlock/ui';
import { PageHeader, TenantIsolationNote } from '../_shell/PageHeader';
import { SAMPLE_TENANT } from '../_shell/nav';
import { DomainForm, type DnsRecord } from './DomainForm';
import './domain.css';

export const metadata: Metadata = {
  title: 'Domain',
};

/**
 * Domain (M20). Custom app domain + DNS instructions + ownership verification +
 * SSL provisioning — all STUBBED. The hard rule stated in the copy and the leaf:
 * a custom domain requires verified ownership BEFORE any traffic is routed to it.
 * TODO: wire DNS verification + ACME SSL provisioning (org-scoped).
 */
export default function DomainPage() {
  const tenant = SAMPLE_TENANT;

  // Sample DNS records the partner must add. Values are placeholders.
  const dnsRecords: ReadonlyArray<DnsRecord> = [
    {
      type: 'TXT',
      host: '_fxa-verify.academy',
      value: `fxa-verify=org_${tenant.orgId}-9f3c1a`,
      purpose: 'Proves you control the domain',
    },
    {
      type: 'CNAME',
      host: 'academy',
      value: 'tenants.fxacademy.app',
      purpose: 'Routes traffic once verified',
    },
  ];

  return (
    <>
      <PageHeader
        title="Domain"
        lead="Run your academy on your own domain. Ownership must be verified before any traffic is routed."
      />

      <TenantIsolationNote tenantName={tenant.name} />

      <DomainForm initialDomain="" dnsRecords={dnsRecords} />

      <Disclaimer
        kind="custom"
        variant="callout"
        style={{ marginTop: 28 }}
      >
        Custom domains are only activated after ownership verification and SSL provisioning both
        succeed. Until then your academy stays on its FX Academy tenant URL — we never route a
        live audience to an unverified domain.
      </Disclaimer>
    </>
  );
}
