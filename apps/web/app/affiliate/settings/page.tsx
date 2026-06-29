import type { Metadata } from 'next';
import { Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { AffiliateShell } from '../_components/AffiliateShell';
import { DisclosureConfirm } from './DisclosureConfirm';

export const metadata: Metadata = {
  title: 'Affiliate Settings',
  robots: { index: false, follow: false },
};

/**
 * Affiliate Settings (M14 / PROJECT.md §8.18). RSC shell + one client leaf.
 *
 * Profile, payout account, and the affiliate disclosure confirmation. Form
 * fields are read-only placeholders (no save action wired); the disclosure
 * acknowledgement is the one interactive control and gates payouts.
 * // TODO: wire save actions for affiliate profile + payout-account changes
 * // (payout-account changes are a step-up-auth, audited mutation — PROJECT.md §6.4).
 */
export default async function AffiliateSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? '';

  // TODO: read the persisted disclosure-acceptance + payout-account status.
  const disclosureAccepted = false;

  return (
    <AffiliateShell active="Settings" title="Settings">
      <h1 className="h-md" style={{ margin: 0 }}>
        Affiliate settings
      </h1>
      <p className="muted aff-lead">
        Manage your affiliate profile, payout account and disclosure
        acknowledgement.
      </p>

      <section className="aff-section">
        <h2>Profile</h2>
        <p className="sub muted">How you appear in the affiliate program.</p>
        <div className="aff-panel">
          <div className="aff-form">
            <div className="field">
              <label htmlFor="aff-name">Display name</label>
              <input id="aff-name" className="input" placeholder="Your name or brand" defaultValue="" />
            </div>
            <div className="field">
              <label htmlFor="aff-email">Account email</label>
              <input id="aff-email" className="input" type="email" defaultValue={email} readOnly />
            </div>
            <div className="field">
              <label htmlFor="aff-site">Primary promotion channel</label>
              <input
                id="aff-site"
                className="input"
                placeholder="Website, YouTube, newsletter…"
                defaultValue=""
              />
            </div>
          </div>
        </div>
      </section>

      <section className="aff-section">
        <h2>Payout account</h2>
        <p className="sub muted">Where commission is paid once you are verified.</p>
        <div className="aff-stub" role="status">
          <h3>Stripe Connect onboarding coming soon</h3>
          <p>
            Your payout account is managed through Stripe Connect. Changing payout
            details will require step-up authentication and identity
            re-verification once onboarding is available.
          </p>
          <button
            type="button"
            className="btn btn-forest btn-sm"
            disabled
            aria-disabled="true"
            style={{ marginTop: 12 }}
          >
            Manage payout account (coming soon)
          </button>
        </div>
      </section>

      <section className="aff-section">
        <h2>Affiliate disclosure</h2>
        <p className="sub muted">
          Required acknowledgement. Payouts are blocked until this is accepted.
        </p>
        <div className="aff-panel">
          <DisclosureConfirm initiallyAccepted={disclosureAccepted} />
        </div>
      </section>

      <Disclaimer kind="custom" variant="callout" style={{ marginTop: 24 }}>
        FX Academy is an education and tools platform — not a signal service.
        Affiliates must disclose their relationship wherever they promote it and
        must not imply or guarantee trading profits. Earnings are not guaranteed.
      </Disclaimer>
      <Disclaimer kind="risk" variant="note" style={{ marginTop: 16 }} />
    </AffiliateShell>
  );
}
