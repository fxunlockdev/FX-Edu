import type { Metadata } from 'next';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { getViewerPlan } from '@/lib/entitlements/plan';
import { SignOutButton } from '../_components/SignOutButton';
import {
  TRADE_IDEAS,
  IdeaCard,
  IdeaFilters,
  MarketNewsPanel,
  LivePricesPanel,
  UpgradeGate,
  deriveFacets,
  filterIdeas,
  isLocked,
  resolveFilterState,
  resolvePlan,
  type Plan,
} from './_components';
import './trade-ideas.css';

export const metadata: Metadata = {
  title: 'Trade Ideas',
  robots: { index: false, follow: false },
};

interface TradeIdeasPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Trade Ideas, Market News & Live Prices (M11 / PROJECT.md §8.10, §11). RSC — the
 * `(member)` layout already enforced the server-side auth gate, so this route is
 * reachable only by a signed-in user.
 *
 * Framing: the ideas are educator-published EDUCATIONAL EXAMPLES — not signals,
 * recommendations, or financial advice (§11 🔒, §6.7). A page-level disclaimer
 * AND a per-idea disclaimer make this explicit; `bias` is presented as a view,
 * never a buy/sell directive.
 *
 * Entitlement: the feature is Pro-gated. Plan is read server-side from the
 * shared entitlements helper and defaults DEFENSIVELY to Basic (the server-side
 * gate is authoritative — the UI lock is a hint only, §6.1). A Basic member sees
 * the designed {@link UpgradeGate} and NO idea content is rendered for them, so
 * locked content cannot leak.
 *
 * Filters live in the URL (`?instrument=&timeframe=&educator=&tag=`) so the
 * filtered feed is shareable and the data stays server-rendered. Market news and
 * live prices are STUBBED (see market-data.ts) and degrade gracefully.
 */
export default async function TradeIdeasPage({ searchParams }: TradeIdeasPageProps) {
  const params = await searchParams;

  const plan: Plan = resolvePlan(await getViewerPlan());
  const locked = isLocked(plan);

  const facets = deriveFacets(TRADE_IDEAS);
  const filters = resolveFilterState(params, facets);
  const visible = filterIdeas(TRADE_IDEAS, filters);

  return (
    <div className="ti-page">
      <header className="ti-top">
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

      <main className="ti-main" id="main">
        <h1 className="h-md">Trade Ideas</h1>
        <p className="ti-lead muted">
          Educator-published setups, shared to teach analysis — not to copy.
        </p>

        <Disclaimer kind="custom" variant="callout" className="ti-disclaimer">
          These are educational examples of how our educators analyze markets. They are not signals,
          recommendations, or financial advice. Always do your own analysis and manage your risk.
        </Disclaimer>

        {locked ? (
          <UpgradeGate />
        ) : (
          <div className="ti-layout">
            <div className="ti-feed">
              <IdeaFilters facets={facets} active={filters} />

              {visible.length === 0 ? (
                <p className="muted ti-empty">No ideas match these filters yet.</p>
              ) : (
                <ul className="ti-list">
                  {visible.map((idea) => (
                    <li key={idea.id}>
                      <IdeaCard idea={idea} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <aside className="ti-aside" aria-label="Market context">
              <LivePricesPanel />
              <MarketNewsPanel />
              <section className="ti-side-card ti-learn" aria-labelledby="ti-learn-h">
                <h2 id="ti-learn-h" className="ti-side-title ti-on-dark">
                  Learn the framework
                </h2>
                <p className="ti-learn-body">
                  Every idea maps to a lesson. Study the setup, then practice spotting it yourself.
                </p>
                <a href="/strategies" className="btn btn-glass btn-sm btn-block">
                  Open strategy library
                </a>
              </section>
            </aside>
          </div>
        )}

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </main>
    </div>
  );
}
