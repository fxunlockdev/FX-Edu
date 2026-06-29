import type { Metadata } from 'next';
import { Disclaimer } from '@fxunlock/ui';
import { PageHeader, TenantIsolationNote } from '../_shell/PageHeader';
import { SAMPLE_TENANT } from '../_shell/nav';
import { SettingsForm, type SettingsValues } from './SettingsForm';
import './settings.css';

export const metadata: Metadata = {
  title: 'Settings',
};

/**
 * Settings (M20). Tenant preferences, legal disclosures and support contact.
 * The form is an isolated client leaf; saving is stubbed. All values are scoped
 * to this tenant — when wired, reads/writes go through the RLS-scoped server
 * client so a partner only ever touches their OWN org's settings row.
 * TODO: load + persist tenant settings (RLS-scoped).
 */
export default function SettingsPage() {
  const tenant = SAMPLE_TENANT;

  const initial: SettingsValues = {
    supportEmail: 'support@meridian.co',
    supportUrl: 'https://help.meridian.co',
    timezone: 'Europe/Frankfurt',
    locale: 'en-GB',
    legalEntity: `${tenant.name} Ltd.`,
    disclosures:
      'Meridian Trading Academy provides educational programs only and does not offer personalized investment advice.',
  };

  return (
    <>
      <PageHeader
        title="Settings"
        lead="Tenant preferences, legal disclosures and support contact for your academy."
      />

      <TenantIsolationNote tenantName={tenant.name} />

      <SettingsForm initial={initial} />

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </>
  );
}
