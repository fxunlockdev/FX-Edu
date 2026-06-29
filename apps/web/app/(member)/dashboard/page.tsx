import type { Metadata } from 'next';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '../_components/SignOutButton';
import { summarize, type JournalSummary } from '../journal/journal-stats';
import { TRADE_SELECT_COLUMNS, type TradeRow } from '../journal/trade-fields';
import { derivePlan, type Plan } from './_components/plan';
import {
  deriveDashboard,
  greetingName,
  timeGreeting,
  type DashboardProfile,
} from './_components/dashboard-data';
import { WelcomeBanner } from './_components/WelcomeBanner';
import { OnboardingChecklist } from './_components/OnboardingChecklist';
import { FirstCourseCard } from './_components/FirstCourseCard';
import { LivePrices } from './_components/LivePrices';
import {
  JournalSnapshotCard,
  RiskCalculatorCard,
  PerformanceInsightCard,
  ContinueLearningCard,
  FocusCard,
  MarketNewsCard,
  WebinarCard,
  AiTutorCard,
  CommunityPodCard,
} from './_components/cards';
import './dashboard.css';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

/**
 * Profile columns the dashboard reads (RLS-scoped — user sees only their row).
 * Mirrors the M2 onboarding migration (`profiles.schema.sql`) exactly so the
 * select can never reference a column that isn't deployed. There is no name
 * column on that row, so the greeting derives from the auth email instead.
 */
interface ProfileReadRow {
  account_size: string | null;
  onboarded_at: string | null;
}

/**
 * Member Dashboard (M18 / PROJECT.md §18) — the personalized authenticated home.
 *
 * Auth is already guaranteed by the `(member)` layout. Here we:
 *  1. Derive the caller's plan DEFENSIVELY (defaults Basic; UI locks are hints,
 *     the real entitlement gate lands with the entitlements API — §6.1/§6.2).
 *  2. Read the caller's profile + a trade slice through the RLS-scoped server
 *     client (a user only ever sees their own rows). Both reads DEGRADE
 *     GRACEFULLY: if `profiles`/`trades` aren't deployed yet we fall back to the
 *     new-user/empty state and never error (§18 "price widget degrades
 *     gracefully", applied across the board during bring-up).
 *  3. Compute the view-model with the pure `deriveDashboard` + `summarize`
 *     functions, then render either the guided first-run state or the full
 *     returning-member bento.
 *
 * Locked Pro cards leak no protected content — they show value + an upgrade CTA
 * only; no trade query feeds them (§18 🔒).
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const plan: Plan = derivePlan(user?.id);
  const email = user?.email ?? null;

  // ── RLS-scoped reads (defensive: never throw on undeployed tables) ────────
  let profile: ProfileReadRow | null = null;
  let tradeRows: TradeRow[] = [];

  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('account_size, onboarded_at')
      .eq('id', user.id)
      .maybeSingle();
    profile = (profileData as ProfileReadRow | null) ?? null;

    const { data: tradeData, error: tradeError } = await supabase
      .from('trades')
      .select(TRADE_SELECT_COLUMNS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200);
    if (!tradeError) tradeRows = (tradeData as TradeRow[] | null) ?? [];
  }

  // ── Pure derivations ─────────────────────────────────────────────────────
  const dashProfile: DashboardProfile = {
    onboardedAt: profile?.onboarded_at ?? null,
    accountSize: profile?.account_size ?? null,
  };
  const model = deriveDashboard({ profile: dashProfile, tradeCount: tradeRows.length });
  const summary: JournalSummary = summarize(tradeRows);

  // No name column on the onboarding profile row — greet from the email local-part.
  const name = greetingName(null, email);
  const greeting = timeGreeting();
  const isPro = plan === 'pro';

  return (
    <div className="dash">
      <header className="dash-top">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={isPro ? 'lime-dark' : 'outline'}>{isPro ? 'Pro' : 'Basic'}</Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="dash-main" id="main">
        <div className="dash-bento">
          <WelcomeBanner plan={plan} greeting={greeting} name={name} isNewUser={model.isNewUser} />

          {model.isNewUser ? (
            // First-run guided state: checklist + recommended course + market cards.
            <>
              <OnboardingChecklist
                items={model.checklist}
                done={model.checklistDone}
                percent={model.checklistPercent}
              />
              <FirstCourseCard />
              <LivePrices />
              <MarketNewsCard />
              <AiTutorCard locked={!isPro} />
            </>
          ) : (
            // Returning-member full dashboard bento.
            <>
              <ContinueLearningCard />
              <FocusCard />
              <LivePrices />
              <MarketNewsCard />
              <JournalSnapshotCard summary={summary} />
              <RiskCalculatorCard accountSize={profile?.account_size ?? null} />
              {isPro ? (
                <PerformanceInsightCard summary={summary} />
              ) : (
                <WebinarCard locked={false} />
              )}
              <AiTutorCard locked={!isPro} />
              <CommunityPodCard locked={!isPro} />
            </>
          )}
        </div>

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </main>
    </div>
  );
}
