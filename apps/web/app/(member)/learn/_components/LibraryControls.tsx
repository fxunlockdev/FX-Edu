'use client';

import { useRouter } from 'next/navigation';
import {
  DIFFICULTY_OPTIONS,
  DURATION_BUCKETS,
  LIBRARY_TABS,
  toQueryString,
  type LibraryState,
} from './library-filters';

interface LibraryControlsProps {
  readonly state: LibraryState;
}

/**
 * Learning Paths library controls — tabs + search + difficulty/duration/
 * certificate filters (PROJECT.md §8.4). All state lives in the URL: changing any
 * control pushes a new query string and the RSC page re-filters server-side, so
 * the filtered view is shareable and back-button friendly. This isolated client
 * leaf keeps the page shell a server component.
 *
 * The search box debounce is deliberately light (push on Enter / change) to avoid
 * scroll/keystroke churn; tabs and selects push immediately.
 */
export function LibraryControls({ state }: LibraryControlsProps) {
  const router = useRouter();

  function apply(next: Partial<LibraryState>): void {
    const merged: LibraryState = { ...state, ...next };
    const qs = toQueryString(merged);
    router.push(qs ? `/learn?${qs}` : '/learn');
  }

  return (
    <div className="learn-controls">
      <div className="learn-tabs" role="group" aria-label="Filter courses by collection">
        {LIBRARY_TABS.map((tab) => {
          const on = tab === state.tab;
          return (
            <button
              key={tab}
              type="button"
              className={`learn-tab${on ? ' on' : ''}`}
              aria-pressed={on}
              onClick={() => apply({ tab })}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="learn-filters" role="group" aria-label="Course filters">
        <label className="learn-search">
          <SearchIcon />
          <input
            type="search"
            defaultValue={state.query}
            placeholder="Search courses & lessons"
            aria-label="Search courses and lessons"
            onKeyDown={(e) => {
              if (e.key === 'Enter') apply({ query: (e.target as HTMLInputElement).value });
            }}
            onBlur={(e) => {
              if (e.target.value !== state.query) apply({ query: e.target.value });
            }}
          />
        </label>

        <select
          className="input"
          aria-label="Difficulty"
          value={state.difficulty ?? ''}
          onChange={(e) =>
            apply({
              difficulty:
                e.target.value === '' ? null : (e.target.value as LibraryState['difficulty']),
            })
          }
        >
          <option value="">All difficulty</option>
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          className="input"
          aria-label="Duration"
          value={state.duration ?? ''}
          onChange={(e) => apply({ duration: e.target.value === '' ? null : e.target.value })}
        >
          <option value="">Any duration</option>
          {DURATION_BUCKETS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>

        <label className="learn-check">
          <input
            type="checkbox"
            checked={state.certificateOnly}
            onChange={(e) => apply({ certificateOnly: e.target.checked })}
          />
          <span>Certificate available</span>
        </label>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
