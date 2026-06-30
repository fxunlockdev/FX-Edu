import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { getViewerPlan, isPro } from '@/lib/entitlements/plan';
import { SignOutButton } from '../_components/SignOutButton';
import { TutorChat, TutorLock } from './_components';
import './ai-tutor.css';

export const metadata: Metadata = {
  title: 'AI Tutor',
  robots: { index: false, follow: false },
};

/**
 * Member AI Tutor (M7 / PROJECT.md §7) — server component shell.
 *
 * Auth is already guaranteed by the `(member)` layout. The entitlement (plan)
 * gate is enforced HERE, server-side, before any chat island mounts — the
 * server-side gate is authoritative; the UI lock is only a hint (§6.1). The AI
 * Tutor is Pro-only (§7 🔒).
 *
 * Plan is read from the shared entitlements helper and defaults DEFENSIVELY to
 * Basic, so a caller whose access cannot be proven sees the designed "Upgrade to
 * Pro" lock instead of the chat.
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

  const pro = isPro(await getViewerPlan());

  return (
    <Shell isPro={pro}>
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

      {pro ? <TutorChat /> : <TutorLock />}

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
