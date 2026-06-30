import type { Metadata } from 'next';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { getViewerPlan } from '@/lib/entitlements/plan';
import { SignOutButton } from '../_components/SignOutButton';
import {
  CourseCard,
  LibraryControls,
  UpgradeModal,
  applyFilters,
  buildCardModels,
  isPro,
  readProgress,
  resolveDifficulty,
  resolveDuration,
  resolveTab,
  type LibraryState,
} from './_components';
import './learn.css';

export const metadata: Metadata = {
  title: 'Learning Paths',
  robots: { index: false, follow: false },
};

interface LearnPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

/**
 * Learning Paths library (M3 / PROJECT.md §8.4). RSC — the `(member)` layout
 * already enforced the server-side auth gate, so this route is reachable only by a
 * signed-in user.
 *
 * The whole library state (tab, search, difficulty/duration/certificate filters)
 * lives in the URL, so the filtered grid is shareable and server-rendered with no
 * client data fetching. The interactive controls are an isolated client leaf.
 *
 * Plan is read server-side from the shared entitlements helper and defaults
 * defensively to Basic — the course lock is a UI hint only; the server-side gate
 * is authoritative (§6.1, §8.4). Progress is read through the RLS-scoped client
 * and degrades to "not started" if the `lesson_progress` table is not deployed yet.
 */
export default async function LearnPage({ searchParams }: LearnPageProps) {
  const params = await searchParams;

  const state: LibraryState = {
    tab: resolveTab(firstParam(params.tab)),
    query: firstParam(params.q) ?? '',
    difficulty: resolveDifficulty(firstParam(params.difficulty)),
    duration: resolveDuration(firstParam(params.duration)),
    certificateOnly: firstParam(params.cert) === '1',
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Entitlement + progress are read server-side. Both default safely.
  const plan = await getViewerPlan();
  const progressById = await readProgress(supabase);

  const models = buildCardModels(isPro(plan), progressById);
  const visible = applyFilters(models, state);

  const completedCount = models.filter((m) => m.progress === 100).length;

  return (
    <div className="learn-page">
      <header className="learn-top">
        <a href="/dashboard" aria-label="FX Academy dashboard">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={plan === 'basic' ? 'outline' : 'lime-dark'}>
            {plan === 'basic' ? 'Basic' : 'Pro'}
          </Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="learn-main" id="main">
        <div className="learn-head">
          <h1 className="h-md">Learning Paths</h1>
          <p className="learn-lead muted">
            Five tiers · {models.length} courses · a certificate at every tier
            {completedCount > 0 ? ` · ${completedCount} completed` : ''}
          </p>
        </div>

        <LibraryControls state={state} />

        {visible.length === 0 ? (
          <p className="learn-empty muted">
            No courses match these filters. Try a different tab or clear the search.
          </p>
        ) : (
          <div className="learn-grid">
            {visible.map((model) => (
              <CourseCard key={model.course.id} model={model} />
            ))}
          </div>
        )}

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </main>

      <UpgradeModal />
    </div>
  );
}
