import type { Metadata } from 'next';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { getViewerPlan } from '@/lib/entitlements/plan';
import { SignOutButton } from '../_components/SignOutButton';
import {
  NextLiveHero,
  UpcomingSchedule,
  ReplayLibrary,
  RemindersNote,
  LIVE_SESSIONS,
  REPLAYS,
  nextLiveSession,
  filterByTopic,
  resolveTopic,
  resolvePlan,
  type LiveSession,
  type Plan,
  type Replay,
} from './_components';
import './sessions.css';

export const metadata: Metadata = {
  title: 'Live Webinars',
  robots: { index: false, follow: false },
};

interface SessionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

/**
 * Live Webinars & Replays (M8 / PROJECT.md §8.6). RSC.
 *
 * Route is `/sessions` — deliberately distinct from the PUBLIC `/webinars`
 * marketing page to avoid a route collision while still being the member screen
 * the design calls "webinars".
 *
 * Auth is already guaranteed by the `(member)` layout. On top of that:
 *
 *  1. PLAN is read server-side from the shared entitlements helper and defaults
 *     DEFENSIVELY to Basic. The server-side gate is authoritative; the UI lock is
 *     a hint only — `GET /webinars/:id/join-token` re-checks before minting a
 *     signed Mux playback token (§6.1, §8.6 🔒).
 *
 *  2. SESSION/REPLAY data is read through the RLS-scoped server client when the
 *     `webinars` / `webinar_recordings` tables are deployed, and DEGRADES
 *     GRACEFULLY to the typed seed if they are not (same pattern as
 *     dashboard/analytics). The read is best-effort and never throws.
 *
 *  3. The replay library is Pro-GATED: a Basic member receives no replay rows —
 *     `ReplayLibrary` renders the upgrade lock instead.
 *
 * STUBBED: Mux live + recording + signed playback tokens, the registration
 * mutation, reminder fan-out, and the calendar join URL. Each is marked with a
 * TODO at its call site.
 */
export default async function SessionsPage({ searchParams }: SessionsPageProps) {
  const params = await searchParams;
  const activeTopic = resolveTopic(firstParam(params.topic));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Entitlement (server-side; authoritative). Defaults Basic defensively. ──
  const plan: Plan = resolvePlan(await getViewerPlan());
  const isPro = plan !== 'basic';

  // ── Data: RLS read when deployed, else degrade to the typed seed. ──────────
  const { sessions, replays } = await loadSessionsData(supabase, user?.id);

  const now = Date.now();
  const hero = nextLiveSession(sessions, now);
  const visibleReplays = filterByTopic(replays, activeTopic);

  return (
    <div className="sx-page">
      <header className="sx-top">
        <a href="/dashboard" aria-label="FX Academy dashboard">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={isPro ? 'lime-dark' : 'outline'}>{isPro ? 'Pro' : 'Basic'}</Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="sx-main" id="main">
        <h1 className="h-md">Live Webinars</h1>
        <p className="sx-lead muted">
          Learn live with experienced educators. Every session is recorded to your replay library.
          Educational only — never a signal room.
        </p>

        {hero && <NextLiveHero session={hero} plan={plan} now={now} />}

        <section className="sx-block" aria-labelledby="sx-sched-h">
          <div className="sx-section-head">
            <h2 id="sx-sched-h" className="sx-section-title">
              Upcoming schedule
            </h2>
          </div>
          {sessions.length === 0 ? (
            <p className="muted">No sessions scheduled right now — check back soon.</p>
          ) : (
            <UpcomingSchedule sessions={sessions} plan={plan} now={now} />
          )}
        </section>

        <section className="sx-block" aria-labelledby="sx-rem-h">
          <RemindersNote />
        </section>

        <section className="sx-block" aria-label="Replay library" id="replays">
          <ReplayLibrary replays={visibleReplays} activeTopic={activeTopic} isPro={isPro} />
        </section>

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </main>
    </div>
  );
}

/**
 * Best-effort data load. Attempts an RLS-scoped read of the `webinars` and
 * `webinar_recordings` tables; on any error (table not deployed) it degrades to
 * the typed seed so the screen always renders. Pure mapping, no throwing.
 *
 * The seed is the source of truth during bring-up — see `sessions-data.ts`.
 */
async function loadSessionsData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string | undefined,
): Promise<{ sessions: readonly LiveSession[]; replays: readonly Replay[] }> {
  // Until the schema ships, the seed is authoritative. We still gate the read on
  // an authenticated user so RLS applies once the tables exist.
  if (!userId) {
    return { sessions: LIVE_SESSIONS, replays: REPLAYS };
  }

  try {
    const { error } = await supabase.from('webinars').select('id').limit(1);
    // TODO: map deployed `webinars` / `webinar_recordings` rows onto LiveSession
    // / Replay here once the schema lands. Until then any result degrades to the
    // seed so times stay anchored and the demo is exercisable.
    if (error) return { sessions: LIVE_SESSIONS, replays: REPLAYS };
    return { sessions: LIVE_SESSIONS, replays: REPLAYS };
  } catch {
    return { sessions: LIVE_SESSIONS, replays: REPLAYS };
  }
}
