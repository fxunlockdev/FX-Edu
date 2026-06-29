'use client';

import { useRouter } from 'next/navigation';
import { TABS, type TabKey } from '../notification-fields';

/**
 * Inbox tabs (PROJECT.md §8.16). The active tab is URL state (`?tab=`) — like
 * the strategy/analytics filters — so the filtered inbox is shareable and the
 * RSC page re-reads the RLS-scoped rows on navigation. This isolated leaf keeps
 * the page a server component.
 */
export function NotificationTabs({ active }: { active: TabKey }) {
  const router = useRouter();

  function select(tab: TabKey) {
    router.push(tab === 'all' ? '/notifications' : `/notifications?tab=${tab}`);
  }

  return (
    <div className="ntf-tabs" role="tablist" aria-label="Notification categories">
      {TABS.map((t) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={on}
            className={`ntf-tab${on ? ' on' : ''}`}
            onClick={() => select(t.key)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
