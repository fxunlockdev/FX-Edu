import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '../_components/SignOutButton';
import { TutorChat, TutorLock, derivePlan, type Plan } from './_components';
import './ai-tutor.css';

export const metadata: Metadata = {
  title: 'AI Tutor',
  robots: { index: false, follow: false },
};

/**
 * Member AI Tutor (M7 / PROJECT.md §7) — server component shell.
 *
 * Auth is already guaranteed by the `(member)` layout. The entitlement (plan)
 * gate is enforced HERE, server-side, before any chat island mounts — UI locks
 * are only hints (§6.1). The AI Tutor is Pro-only (§7 🔒).
 *
 * Plan derivation is DEFENSIVE: there is no subscription data wired at runtime
 * yet, so we default the caller to Basic and render the designed "Upgrade to
 * Pro" lock. When the entitlements API is runtime-wired this single flag flips
 * and the Pro branch below renders the chat unchanged.
 * // TODO: read plan from /entitlements once the API is runtime-wired
 *
 * AI responses are STUBBED in {@link TutorChat}: no model/API call yet. The live
 * tutor (RAG over approved course content + pre/post moderation through the API
 * gateway, §6.5) is integrated in a later pass.
 */
export default async function AiTutorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const plan: Plan = derivePlan(user?.id);
  const isPro = plan === 'pro';

  return (
    <Shell isPro={isPro}>
      <header className="tut-head">
        <div>
          <h1 className="h-md">AI Tutor</h1>
          <p className="muted">
            A course-aware tutor that explains, quizzes, and helps you reflect — grounded in your
            curriculum and bounded by hard safety limits.
          </p>
        </div>
        <Badge tone="lime-dark">Course-aware</Badge>
      </header>

      {isPro ? <TutorChat /> : <TutorLock />}

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </Shell>
  );
}

/** Member chrome — matches the dashboard / analytics shell. */
function Shell({ isPro, children }: { isPro: boolean; children: ReactNode }) {
  return (
    <div className="tut">
      <header className="tut-top">
        <a href="/dashboard" aria-label="FX Academy dashboard">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={isPro ? 'lime-dark' : 'outline'}>{isPro ? 'Pro' : 'Basic'}</Badge>
          <SignOutButton />
        </div>
      </header>
      <main className="tut-main" id="main">
        {children}
      </main>
    </div>
  );
}
