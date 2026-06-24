import type { Metadata } from 'next';
import { PublicNav, Footer } from '@fxunlock/ui';
import {
  CurriculumHero,
  LearningLoop,
  TierPath,
  CertificateBand,
  JoinCta,
} from './_sections';
import { ReferralBanner } from '../(marketing)/_sections';
import { sanitizeRef } from '@/lib/referral';
import './_sections/curriculum.css';

export const metadata: Metadata = {
  title: 'Curriculum',
  description:
    'A structured five-tier forex curriculum — Entry, Beginner, Intermediate, Advanced, and Psychology. Each tier builds on the last and ends with a verifiable certificate. Educational content only.',
  openGraph: {
    title: 'Curriculum · FX Academy',
    description:
      'Five forex tiers that build on each other, from first principles to advanced execution. Included in Pro.',
  },
};

interface CurriculumPageProps {
  // Next.js 15: searchParams is async.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Public Curriculum page (PROJECT.md §8.4 / module 1). Server component.
 *
 * Reads + sanitizes `?ref=` and forwards it through every CTA so referral
 * attribution survives into checkout (the cookie is captured in middleware).
 * Renders PublicNav (active="Curriculum") + Footer, and presents all five
 * tiers, the learning loop, plan-gating hints, and certificate availability.
 * Plan locks here are presentation hints only — entitlements are server-side.
 */
export default async function CurriculumPage({ searchParams }: CurriculumPageProps) {
  const params = await searchParams;
  const refCode = sanitizeRef(params.ref);

  return (
    <>
      <ReferralBanner code={refCode} />
      <PublicNav active="Curriculum" />

      <main id="main">
        <CurriculumHero refCode={refCode} />
        <LearningLoop />
        <TierPath refCode={refCode} />
        <CertificateBand refCode={refCode} />
        <JoinCta refCode={refCode} />
      </main>

      <Footer />
    </>
  );
}
