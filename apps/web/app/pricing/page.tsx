import type { Metadata } from 'next';
import { PublicNav, Footer } from '@fxunlock/ui';
import { ReferralBanner } from '../(marketing)/_sections';
import {
  PricingHero,
  FeatureComparison,
  PricingFaq,
  PricingTestimonials,
  PricingCta,
} from './_sections';
import { sanitizeRef } from '@/lib/referral';
import './_sections/pricing.css';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Transparent FX Academy pricing. Start on Basic, unlock the full system with Pro, or join the Elite waitlist. Cancel anytime — educational content only, never financial advice.',
  alternates: { canonical: '/pricing' },
};

interface PricingPageProps {
  // Next.js 15: searchParams is async.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Public Pricing page. Server component.
 *
 * Reads `?ref=`, sanitizes it, shows the referral banner when valid, and
 * forwards the code onto every checkout CTA (alongside the plan id) so
 * attribution survives the click. PublicNav + Footer wrap every page; the
 * footer carries the standing risk disclaimer.
 */
export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams;
  const refCode = sanitizeRef(params.ref);

  return (
    <>
      <ReferralBanner code={refCode} />
      <PublicNav active="Pricing" />

      <main id="main">
        <PricingHero refCode={refCode} />
        <FeatureComparison />
        <PricingTestimonials />
        <PricingFaq />
        <PricingCta refCode={refCode} />
      </main>

      <Footer />
    </>
  );
}
