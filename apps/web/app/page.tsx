import { PublicNav, Footer } from '@fxunlock/ui';
import {
  Hero,
  Problem,
  ProductLoop,
  CurriculumPreview,
  ToolsSection,
  WebinarSection,
  PricingTeaser,
  Testimonials,
  FinalCta,
  ReferralBanner,
} from './(marketing)/_sections';
import { sanitizeRef } from '@/lib/referral';
import './(marketing)/_sections/home.css';

interface HomePageProps {
  // Next.js 15: searchParams is async.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Public Home page (PROJECT.md §9 module 1). Server component.
 * Reads `?ref=`, sanitizes it, and shows the referral banner when valid.
 * The cookie is captured in middleware.ts (sanitized) on first arrival.
 * Every page renders PublicNav + Footer and carries the risk disclaimer
 * (in the footer + inline where AI/testimonials appear).
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const refCode = sanitizeRef(params.ref);

  return (
    <>
      <ReferralBanner code={refCode} />
      <PublicNav active="Home" />

      <main id="main">
        <Hero />
        <Problem />
        <ProductLoop />
        <CurriculumPreview />
        <ToolsSection />
        <WebinarSection />
        <PricingTeaser />
        <Testimonials />
        <FinalCta />
      </main>

      <Footer />
    </>
  );
}
