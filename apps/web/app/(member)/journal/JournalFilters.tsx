'use client';

import { useRouter } from 'next/navigation';
import type { LabeledOption } from './trade-fields';

export interface JournalFilterValues {
  readonly pair: string;
  readonly result: string;
  readonly session: string;
  readonly setup: string;
  readonly date: string;
}

interface JournalFiltersProps {
  values: JournalFilterValues;
  pairs: ReadonlyArray<LabeledOption<string>>;
  results: ReadonlyArray<LabeledOption<string>>;
  sessions: ReadonlyArray<LabeledOption<string>>;
  setups: ReadonlyArray<LabeledOption<string>>;
}

/**
 * Journal filter controls (PROJECT.md §8.8: filter by pair / result / session /
 * setup / date). State lives in the URL — changing a filter pushes a new query
 * string, and the RSC page re-reads the RLS-scoped query with it. This keeps
 * filters shareable and back-button friendly (web URL-as-state pattern) and
 * means the data read stays server-side.
 */
export function JournalFilters({ values, pairs, results, sessions, setups }: JournalFiltersProps) {
  const router = useRouter();

  function apply(next: Partial<JournalFilterValues>) {
    const merged: JournalFilterValues = { ...values, ...next };
    const qs = new URLSearchParams();
    if (merged.pair) qs.set('pair', merged.pair);
    if (merged.result) qs.set('result', merged.result);
    if (merged.session) qs.set('session', merged.session);
    if (merged.setup) qs.set('setup', merged.setup);
    if (merged.date) qs.set('date', merged.date);
    const query = qs.toString();
    router.push(query ? `/journal?${query}` : '/journal');
  }

  return (
    <div className="jrnl-filters" role="group" aria-label="Filter trades">
      <select
        className="input"
        aria-label="Filter by pair"
        value={values.pair}
        onChange={(e) => apply({ pair: e.target.value })}
      >
        <option value="">All pairs</option>
        {pairs.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className="input"
        aria-label="Filter by result"
        value={values.result}
        onChange={(e) => apply({ result: e.target.value })}
      >
        <option value="">All results</option>
        {results.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className="input"
        aria-label="Filter by session"
        value={values.session}
        onChange={(e) => apply({ session: e.target.value })}
      >
        <option value="">All sessions</option>
        {sessions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className="input"
        aria-label="Filter by setup"
        value={values.setup}
        onChange={(e) => apply({ setup: e.target.value })}
      >
        <option value="">All setups</option>
        {setups.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <input
        className="input"
        type="date"
        aria-label="Filter from date"
        value={values.date}
        onChange={(e) => apply({ date: e.target.value })}
      />
    </div>
  );
}
