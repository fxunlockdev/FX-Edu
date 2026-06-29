import type { Metadata } from 'next';
import { Disclaimer } from '@fxunlock/ui';
import { PageHeader, TenantIsolationNote } from '../_shell/PageHeader';
import { SAMPLE_TENANT } from '../_shell/nav';
import { BrandingForm, type BrandingValues } from './BrandingForm';
import './branding.css';

export const metadata: Metadata = {
  title: 'Branding',
};

/**
 * Branding (M20). RSC page that loads the tenant's current theme (stubbed) and
 * hands it to an isolated client form leaf with a live preview. Saving is
 * stubbed; when wired, writes go through an RLS-scoped server action so a
 * partner can only ever edit their OWN tenant's theme.
 * TODO: load branding from the tenant theme (RLS-scoped read).
 */
export default function BrandingPage() {
  const tenant = SAMPLE_TENANT;

  // Sample/stubbed current branding for this tenant only.
  const initial: BrandingValues = {
    displayName: tenant.name,
    tagline: 'Disciplined forex education · powered by FX Academy',
    logoText: tenant.shortCode,
    faviconText: tenant.shortCode,
    primaryColor: '#0f3218',
    accentColor: tenant.accentHex,
    theme: 'light',
    footerLegal:
      'Educational content and tools only. Not financial advice. Trading involves substantial risk.',
  };

  return (
    <>
      <PageHeader
        title="Branding"
        lead="Logo, favicon, brand colors, default appearance and legal copy. Changes apply to your tenant only."
      />

      <TenantIsolationNote tenantName={tenant.name} />

      <BrandingForm initial={initial} />

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </>
  );
}
