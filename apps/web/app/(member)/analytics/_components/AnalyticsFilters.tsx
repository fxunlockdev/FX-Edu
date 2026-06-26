'use client';

import { useRouter } from 'next/navigation';

export interface AnalyticsFilterValues {
  /** Lookback window key: '30d' | '90d' | 'ytd' | 'all'. */
  readonly range: string;
  /** When true, open trades are included in the analyzed set. */
  readonly includeOpen: boolean;
}

interface AnalyticsFiltersProps {
  readonly values: AnalyticsFilterValues;
}

const RANGE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'This year' },
  { value: 'all', label: 'All time' },
];

/**
 * Analytics controls — date range + an "include open trades" toggle. State lives
 * in the URL (shareable, back-button friendly) exactly like the journal filters:
 * changing a control pushes a new query string and the RSC page re-reads the
 * RLS-scoped query with it. The interactive leaf is isolated here; the page
 * shell stays a server component.
 */
export function AnalyticsFilters({ values }: AnalyticsFiltersProps) {
  const router = useRouter();

  function apply(next: Partial<AnalyticsFilterValues>) {
    const merged: AnalyticsFilterValues = { ...values, ...next };
    const qs = new URLSearchParams();
    if (merged.range && merged.range !== '90d') qs.set('range', merged.range);
    if (merged.includeOpen) qs.set('open', '1');
    const query = qs.toString();
    router.push(query ? `/analytics?${query}` : '/analytics');
  }

  return (
    <div className="ana-filters" role="group" aria-label="Analytics filters">
      <select
        className="input"
        aria-label="Date range"
        value={values.range}
        onChange={(e) => apply({ range: e.target.value })}
      >
        {RANGE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label className="ana-toggle">
        <input
          type="checkbox"
          checked={values.includeOpen}
          onChange={(e) => apply({ includeOpen: e.target.checked })}
        />
        <span>Include open trades</span>
      </label>
    </div>
  );
}

export { RANGE_OPTIONS };
