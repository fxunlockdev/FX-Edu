'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { FILTER_KEYS, type FilterKey, type IdeaFacets, type IdeaFilterState } from './ideas-types';

interface IdeaFiltersProps {
  facets: IdeaFacets;
  active: IdeaFilterState;
}

/** Label + facet-list lookup per URL filter key. */
const FILTER_META: Record<FilterKey, { label: string; allLabel: string; key: keyof IdeaFacets }> = {
  instrument: { label: 'Pair / instrument', allLabel: 'All pairs', key: 'instruments' },
  timeframe: { label: 'Timeframe', allLabel: 'All timeframes', key: 'timeframes' },
  educator: { label: 'Educator', allLabel: 'All educators', key: 'educators' },
  tag: { label: 'Strategy tag', allLabel: 'All tags', key: 'tags' },
};

/**
 * Trade-idea filters (M11). State lives entirely in the URL search params
 * (`?instrument=&timeframe=&educator=&tag=`) — selecting a value pushes a new
 * query string and the RSC page re-filters server-side. This keeps the filtered
 * feed shareable and back-button friendly (web URL-as-state pattern) with no
 * client data fetching; this leaf only translates a select change into a route
 * push. Clearing one filter preserves the others.
 *
 * This is the ONLY client component in the module — everything else is a server
 * component.
 */
export function IdeaFilters({ facets, active }: IdeaFiltersProps) {
  const router = useRouter();

  const apply = useCallback(
    (key: FilterKey, value: string): void => {
      const next: Record<FilterKey, string | null> = {
        instrument: active.instrument,
        timeframe: active.timeframe,
        educator: active.educator,
        tag: active.tag,
      };
      next[key] = value === '' ? null : value;

      const query = new URLSearchParams();
      for (const k of FILTER_KEYS) {
        const v = next[k];
        if (v) query.set(k, v);
      }
      const qs = query.toString();
      router.push(qs ? `/trade-ideas?${qs}` : '/trade-ideas');
    },
    [active, router],
  );

  const hasActive = FILTER_KEYS.some((k) => active[k] !== null);

  return (
    <div className="ti-filters" role="group" aria-label="Filter trade ideas">
      {FILTER_KEYS.map((key) => {
        const meta = FILTER_META[key];
        const options = facets[meta.key];
        const value = active[key] ?? '';
        return (
          <label className="ti-filter" key={key}>
            <span className="ti-filter-label">{meta.label}</span>
            <select
              className="input ti-select"
              value={value}
              onChange={(event) => apply(key, event.target.value)}
            >
              <option value="">{meta.allLabel}</option>
              {options.map((opt) => (
                <option value={opt} key={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        );
      })}

      {hasActive && (
        <button type="button" className="ti-clear" onClick={() => router.push('/trade-ideas')}>
          Clear filters
        </button>
      )}
    </div>
  );
}
