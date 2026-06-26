'use client';

import { useRouter } from 'next/navigation';
import { FILTER_TABS, type StrategyCategory } from './strategies-types';

interface StrategyFiltersProps {
  /** The currently active category, or `null` for "All". */
  active: StrategyCategory | null;
}

/**
 * Strategy Library filter tabs (PRD §10: All / Technical / Smart Money / Trend /
 * Range). State lives in the URL `?category=` param — selecting a tab pushes a
 * new query string and the RSC page re-filters server-side. This keeps the
 * filtered view shareable and back-button friendly (web URL-as-state pattern),
 * with no client data fetching.
 *
 * Rendered as semantic tablist-style toggle buttons; the active tab carries
 * `aria-pressed` for assistive tech.
 */
export function StrategyFilters({ active }: StrategyFiltersProps) {
  const router = useRouter();

  function select(category: StrategyCategory | null): void {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    router.push(`/strategies${query}`);
  }

  return (
    <div className="strat-filters" role="group" aria-label="Filter strategies by category">
      {FILTER_TABS.map((tab) => {
        const isOn = tab.category === active;
        return (
          <button
            key={tab.label}
            type="button"
            className={`strat-ft${isOn ? ' on' : ''}`}
            aria-pressed={isOn}
            onClick={() => select(tab.category)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
