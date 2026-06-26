import type { Metadata } from 'next';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { SignOutButton } from '../_components/SignOutButton';
import {
  STRATEGIES,
  StrategyFilters,
  filterByCategory,
  isLocked,
  resolveCategory,
  resolvePlan,
  type Plan,
  type Strategy,
} from './_components';
import './strategies.css';

export const metadata: Metadata = {
  title: 'Strategy Library',
  robots: { index: false, follow: false },
};

interface StrategiesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

/**
 * Strategy Library grid (M10 / PRD §10). RSC — the `(member)` layout already
 * enforced the server-side auth gate, so this route is reachable only by a
 * signed-in user. The category filter lives in the URL (`?category=`), so the
 * filtered view is shareable and the data stays server-rendered.
 *
 * Plan is derived defensively and defaults to Basic — the UI lock is a hint
 * only; the real entitlement gate is server-side (PROJECT.md §6.1).
 * TODO: read plan from /entitlements — feed the resolved plan into resolvePlan().
 */
export default async function StrategiesPage({ searchParams }: StrategiesPageProps) {
  const params = await searchParams;
  const activeCategory = resolveCategory(firstParam(params.category));

  // TODO: read plan from /entitlements — until then resolvePlan() defaults Basic.
  const plan: Plan = resolvePlan();

  const visible = filterByCategory(STRATEGIES, activeCategory);

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
        <h1 className="h-md">Strategy Library</h1>
        <p className="strat-lead muted">
          Documented, rule-based playbooks. Each one teaches a repeatable process, not a promise.
        </p>

        <StrategyFilters active={activeCategory} />

        {visible.length === 0 ? (
          <p className="muted">No playbooks in this category yet.</p>
        ) : (
          <ul className="sgrid">
            {visible.map((strategy) => (
              <li key={strategy.slug}>
                <StrategyCard strategy={strategy} locked={isLocked(strategy, plan)} />
              </li>
            ))}
          </ul>
        )}

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </main>
    </div>
  );
}

function StrategyCard({ strategy, locked }: { strategy: Strategy; locked: boolean }) {
  return (
    <article className="strat-card">
      <div className={`sbanner sbanner-${strategy.bannerIndex}`}>
        <Badge tone="lime-dark">{strategy.category}</Badge>
      </div>
      <div className="sbody">
        <h2>{strategy.name}</h2>
        <div className="smeta">
          <span>
            <b>{strategy.difficulty}</b>
          </span>
          <span>
            <b>{strategy.lessons}</b> lessons
          </span>
        </div>
        <p className="sdesc muted">{strategy.summary}</p>

        {locked ? (
          <>
            <p className="slock-row">
              <LockIcon />
              Included with Pro
            </p>
            <a href="/pricing" className="btn btn-ghost btn-sm btn-block">
              Unlock with Pro
            </a>
          </>
        ) : (
          <a href={`/strategies/${strategy.slug}`} className="btn btn-forest btn-sm btn-block">
            Open playbook
          </a>
        )}
      </div>
    </article>
  );
}

function LockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
