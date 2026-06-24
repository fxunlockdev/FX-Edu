import type { Metadata } from 'next';
import { PublicNav, Footer } from '@fxunlock/ui';
import { sanitizeRef } from '@/lib/referral';
import { AiHero, AgentModes, Guardrails, AiCta } from './_sections';
import { ReferralBanner } from '../(marketing)/_sections';
import '../(marketing)/_sections/home.css';
import './_sections/ai-learning.css';

export const metadata: Metadata = {
  title: 'AI Learning — A Course-Aware Tutor',
  description:
    'Meet the FX Academy AI tutor: a course-aware learning assistant with four modes — Explain, Quiz me, What’s next, and Review a trade. Educational only. It never gives buy/sell signals, entry or exit levels, or profit guarantees.',
  alternates: { canonical: '/ai-learning' },
};

interface AiLearningPageProps {
  // Next.js 15: searchParams is async.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Public AI Learning page (PROJECT.md §9 module 1 / §6.5). Server component.
 *
 * Explains the course-aware AI tutor and its four educational modes, with a
 * typewriter chat preview and a prominent guardrails surface. The AI is
 * strictly educational: it never recommends trades, gives entry/exit signals,
 * or guarantees profit (§5, §6.7, §7.2). `?ref=` is sanitized and forwarded
 * into the Pro join CTAs so affiliate attribution survives the click.
 */
export default async function AiLearningPage({ searchParams }: AiLearningPageProps) {
  const params = await searchParams;
  const refCode = sanitizeRef(params.ref);

  return (
    <>
      <ReferralBanner code={refCode} />
      <PublicNav active="AI Learning" />

      <main id="main">
        <AiHero refCode={refCode} />
        <AgentModes />
        <Guardrails />
        <AiCta refCode={refCode} />
      </main>

      <Footer />
    </>
  );
}
