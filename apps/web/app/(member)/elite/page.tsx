import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '../_components/SignOutButton';
import {
  deriveEliteAccess,
  EliteOverview,
  CoachingCalls,
  EducatorQa,
  EarlyAccess,
  WaitlistGate,
  type EliteAccess,
} from './_components';
import './elite.css';

export const metadata: Metadata = {
  title: 'Elite Cohort & Coaching',
  robots: { index: false, follow: false },
};

/**
 * Elite Cohort & Coaching (M21 / PROJECT.md §9 module 21). RSC — auth is already
 * guaranteed by the `(member)` layout, so this route is reachable only by a
 * signed-in user.
 *
 * Entitlement gate (server-side, §6.1 "UI locks are hints; the server decides"):
 * Elite access is derived DEFENSIVELY via {@link deriveEliteAccess}. Elite is not
 * yet sellable — per the pricing it is "from $147/mo" on a waitlist (§5) — so the
 * default is not-Elite. A non-Elite caller gets the designed {@link WaitlistGate}
 * and NONE of the Elite sections are rendered, so coaching calls, the Q&A
 * library, and early-access content cannot leak.
 * TODO: read plan from /entitlements — feed the resolved access in here.
 *
 * Stubs: the coaching "Join call" button is non-functional (two-way small-group
 * video via LiveKit Cloud / Amazon Chime SDK is not wired — no SDK/dep added),
 * and the educator Q&A submit form has no backend yet. Both are labelled as
 * coming soon. Copy is education-only — no profit/guarantee language (§6.7).
 */
export default async function ElitePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Entitlement gate (server-side). Defaults to not-Elite until wired. ──────
  const access: EliteAccess = deriveEliteAccess(user?.id);

  if (!access.isElite) {
    return (
      <Shell isElite={false}>
        <div className="el-head">
          <h1 className="h-md">Elite Cohort &amp; Coaching</h1>
          <p className="muted">
            The high-touch tier — live coaching, educator Q&amp;A, and early access in a small
            cohort.
          </p>
        </div>
        <WaitlistGate tier={access.tier} />
        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </Shell>
    );
  }

  // ── Elite path: full cohort surface. ────────────────────────────────────────
  return (
    <Shell isElite>
      <div className="el-head">
        <h1 className="h-md">Elite Cohort &amp; Coaching</h1>
        <p className="muted">
          Your high-touch home: live coaching, direct educator Q&amp;A, and early access to new
          content — built to sharpen process and discipline, never to promise an outcome.
        </p>
      </div>

      <EliteOverview />
      <CoachingCalls />
      <EducatorQa />
      <EarlyAccess />

      <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
    </Shell>
  );
}

function Shell({ isElite, children }: { isElite: boolean; children: ReactNode }) {
  return (
    <div className="el">
      <header className="el-top">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={isElite ? 'lime-dark' : 'outline'}>{isElite ? 'Elite' : 'Coming soon'}</Badge>
          <SignOutButton />
        </div>
      </header>
      <main className="el-main" id="main">
        {children}
      </main>
    </div>
  );
}
