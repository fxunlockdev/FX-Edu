import type { Metadata } from 'next';
import { PublicNav, Footer } from '@fxunlock/ui';
import {
  AffiliateHero,
  HowItWorks,
  CommissionTiers,
  Payouts,
  PromoAssets,
  AffiliateFaq,
  ApplyCta,
} from './_sections';
import './_sections/affiliates.css';

export const metadata: Metadata = {
  title: 'Affiliates — Earn Recurring Commission',
  description:
    'Join the FX Academy affiliate program: 20% recurring on Basic and 30% recurring on Pro referrals, a 60-day cookie window, ready-made promo assets, and automatic payouts via Stripe Connect. Earnings depend on referrals and are not guaranteed.',
  alternates: { canonical: '/affiliates' },
  openGraph: {
    type: 'website',
    title: 'FX Academy Affiliates — Earn Recurring Commission',
    description:
      'Promote an education-first trading platform. Recurring commission, transparent attribution, and Stripe Connect payouts.',
  },
};

/**
 * Public Affiliates landing page (PROJECT.md §9 module 1). Server component.
 * Pitches the affiliate program — commissions, how it works, payouts, promo
 * assets, FAQ, and the apply CTA — and carries the affiliate disclosure plus
 * earnings-are-not-guaranteed language. Renders PublicNav + Footer like every
 * marketing page.
 */
export default function AffiliatesPage() {
  return (
    <>
      <PublicNav active="Affiliates" />

      <main id="main">
        <AffiliateHero />
        <HowItWorks />
        <CommissionTiers />
        <Payouts />
        <PromoAssets />
        <AffiliateFaq />
        <ApplyCta />
      </main>

      <Footer />
    </>
  );
}
