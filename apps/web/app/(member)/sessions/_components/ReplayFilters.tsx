'use client';

import { useRouter } from 'next/navigation';
import { TOPIC_TABS, type SessionTopic } from './sessions-types';

interface ReplayFiltersProps {
  /** The currently active topic, or `null` for "All topics". */
  readonly active: SessionTopic | null;
}

/**
 * Replay-library topic filter tabs (M8 ✨ topic filter). State lives in the URL
 * `?topic=` param — selecting a tab pushes a new query string and the RSC page
 * re-filters server-side, so the filtered view is shareable and back-button
 * friendly (web URL-as-state pattern) with no client data fetching.
 *
 * Rendered as semantic toggle buttons; the active tab carries `aria-pressed`.
 */
export function ReplayFilters({ active }: ReplayFiltersProps) {
  const router = useRouter();

  function select(topic: SessionTopic | null): void {
    const query = topic ? `?topic=${encodeURIComponent(topic)}` : '';
    router.push(`/sessions${query}#replays`);
  }

  return (
    <div className="sx-rfilters" role="group" aria-label="Filter replays by topic">
      {TOPIC_TABS.map((tab) => {
        const isOn = tab.topic === active;
        return (
          <button
            key={tab.label}
            type="button"
            className={`sx-rft${isOn ? ' on' : ''}`}
            aria-pressed={isOn}
            onClick={() => select(tab.topic)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
