import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { SignOutButton } from '../../_components/SignOutButton';
import {
  PlaybookContent,
  allStrategySlugs,
  getStrategyBySlug,
  isLocked,
  resolvePlan,
  type Plan,
  type Strategy,
} from '../_components';
import '../strategies.css';

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-render every playbook detail route from the dataset. */
export function generateStaticParams(): { slug: string }[] {
  return allStrategySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const strategy = getStrategyBySlug(slug);
  return {
    title: strategy ? `${strategy.name} · Strategy Library` : 'Strategy Library',
    robots: { index: false, follow: false },
  };
}

/**
 * Playbook detail (M10 / PRD §10). RSC — auth is enforced by the `(member)`
 * layout. Renders the full educational body (concept, rules, setup criteria,
 * invalidation, risk notes, examples, related lessons, quiz/checklist) for
 * accessible playbooks. A Pro-gated playbook viewed on a Basic plan renders a
 * blurred preview plus an upgrade prompt instead of the body.
 *
 * Plan is derived defensively (defaults Basic) — the UI lock is a hint; the real
 * gate is server-side (PROJECT.md §6.1).
 * TODO: read plan from /entitlements — feed the resolved plan into resolvePlan().
 */
export default async function StrategyDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const strategy = getStrategyBySlug(slug);
  if (!strategy) notFound();

  // TODO: read plan from /entitlements — until then resolvePlan() defaults Basic.
  const plan: Plan = resolvePlan();
  const locked = isLocked(strategy, plan);

  return (
    <div className="strat-page">
      <header className="strat-top">
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

      <main className="strat-main" id="main">
        <a href="/strategies" className="strat-back">
          <BackArrow />
          All strategies
        </a>

        <div className="strat-detail-head">
          <Badge tone="lime-dark">{strategy.category}</Badge>
          {locked && <Badge tone="outline">Pro</Badge>}
          <h1 className="h-md">{strategy.name}</h1>
        </div>
        <div className="strat-detail-meta">
          <span>
            <b>{strategy.difficulty}</b>
          </span>
          <span>
            <b>{strategy.lessons}</b> lessons
          </span>
        </div>

        {locked ? <GatedPreview strategy={strategy} /> : <PlaybookContent strategy={strategy} />}

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </main>
    </div>
  );
}

/**
 * The Basic-plan gated view: an upgrade prompt over a blurred, non-interactive
 * teaser of the playbook concept. No rule/setup content is rendered in full, so
 * paid material is not leaked client-side even though the real gate is the API.
 */
function GatedPreview({ strategy }: { strategy: Strategy }) {
  return (
    <div>
      <div className="strat-gate">
        <span className="strat-gate-icon">
          <LockIcon />
        </span>
        <h2>This playbook is included with Pro</h2>
        <p className="muted">
          {strategy.name} is part of the full Strategy Library — {strategy.lessons} lessons covering
          the concept, rules, setup criteria, invalidation, and a process checklist. Upgrade to Pro
          to open every playbook.
        </p>
        <a href="/pricing" className="btn btn-forest btn-sm">
          See Pro plans
        </a>
      </div>

      <div className="strat-locked-preview" aria-hidden="true">
        <section className="strat-section">
          <h2>Concept</h2>
          <p className="muted">{strategy.body.concept}</p>
        </section>
      </div>
    </div>
  );
}

function BackArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
