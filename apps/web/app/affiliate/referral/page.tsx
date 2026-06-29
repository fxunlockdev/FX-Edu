import type { Metadata } from 'next';
import { Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { AffiliateShell } from '../_components/AffiliateShell';
import { deriveReferralCode, REFERRAL_BASE_URL } from '../_components/referral';
import { ReferralBuilder } from './ReferralBuilder';

export const metadata: Metadata = {
  title: 'Referral Link',
  robots: { index: false, follow: false },
};

/**
 * Referral Link (M14 / PROJECT.md §8.18). RSC shell + one client leaf.
 *
 * The referral CODE is derived SERVER-SIDE from the authenticated user id
 * ({@link deriveReferralCode}) and passed down — it is never minted on the
 * client. This matters because attribution is **server-side and
 * tamper-resistant**: the `?ref=` parameter is recorded by the attribution
 * backend, validated against an approved affiliate code, and **self-referral is
 * blocked** (a code cannot earn commission on its own owner's subscription).
 * // TODO: wire attribution backend — persist a unique server-minted code per
 * // affiliate, record click/visit events, enforce the 60-day last-touch cookie,
 * // and reject self-referrals at attribution time.
 */
export default async function ReferralPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const code = `FX${deriveReferralCode(user?.id)}`;

  return (
    <AffiliateShell active="Referral Link" title="Referral Link">
      <h1 className="h-md" style={{ margin: 0 }}>
        Build &amp; share your referral link
      </h1>
      <p className="muted aff-lead">
        Your unique code, a ready-to-share link, and a UTM campaign builder for
        attributing traffic to specific channels.
      </p>

      <ReferralBuilder code={code} baseUrl={REFERRAL_BASE_URL} />

      <Disclaimer kind="custom" variant="callout" style={{ marginTop: 24 }}>
        Attribution is tracked server-side and is tamper-resistant. Commission is
        credited on a 60-day last-touch basis and only on completed, non-refunded
        payments. Self-referrals are not eligible. You must clearly disclose your
        affiliate relationship with FX Academy wherever you share this link.
        Earnings are not guaranteed.
      </Disclaimer>
    </AffiliateShell>
  );
}
