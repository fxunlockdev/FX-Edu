import type { Metadata } from 'next';
import { PublicNav, Footer } from '@fxunlock/ui';
import {
  WebinarsHero,
  UpcomingSessions,
  SessionTypes,
  RegisterSection,
  ReplayTeaser,
  JoinCta,
} from './_sections';
import { sanitizeRef } from '@/lib/referral';
import { ReferralBanner } from '../(marketing)/_sections';
import '../(marketing)/_sections/home.css';
import './_sections/webinars.css';

export const metadata: Metadata = {
  title: 'Live Webinars',
  description:
    'Weekly live forex education webinars — technical analysis, fundamental analysis, and trading mindset. Every session is recorded with transcripts and AI summaries. Educational content only, never financial advice.',
  openGraph: {
    title: 'FX Academy — Live Webinars',
    description:
      'Weekly live webinars with experienced educators. Register free, or go Pro for the full replay library.',
  },
};

interface WebinarsPageProps {
  // Next.js 15: searchParams is async.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Append a sanitized referral code to a path as `?ref=` (spaces encoded). */
function withRef(path: string, code: string | null): string {
  if (!code) return path;
  return `${path}?ref=${encodeURIComponent(code)}`;
}

/**
 * Public Webinars landing page (FX Unlock). Server component.
 *
 * Reads `?ref=`, sanitizes it (lib/referral.ts), shows the referral banner when
 * valid, and threads the code through every Pro CTA so the referral survives
 * navigation. Renders PublicNav (active="Webinars") + Footer and carries the
 * educational/risk disclaimer in the registration block and footer.
 */
export default async function WebinarsPage({ searchParams }: WebinarsPageProps) {
  const params = await searchParams;
  const refCode = sanitizeRef(params.ref);
  const proHref = withRef('/pricing', refCode);

  return (
    <>
      <ReferralBanner code={refCode} />
      <PublicNav active="Webinars" />

      <main id="main">
        <WebinarsHero proHref={proHref} />
        <UpcomingSessions proHref={proHref} />
        <SessionTypes />
        <RegisterSection />
        <ReplayTeaser proHref={proHref} />
        <JoinCta proHref={proHref} />
      </main>

      <Footer />
    </>
  );
}
