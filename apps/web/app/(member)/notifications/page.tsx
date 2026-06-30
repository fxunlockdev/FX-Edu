import type { Metadata } from 'next';
import { Logo, Badge } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { getViewerPlan, isPro } from '@/lib/entitlements/plan';
import { SignOutButton } from '../_components/SignOutButton';
import { NotificationItem } from './_components/NotificationItem';
import { MarkAllReadButton } from './_components/MarkAllReadButton';
import { NotificationTabs } from './_components/NotificationTabs';
import {
  NOTIFICATION_SELECT_COLUMNS,
  resolveTab,
  type NotificationRow,
  type TabKey,
} from './notification-fields';
import './notifications.css';

export const metadata: Metadata = {
  title: 'Notifications',
  robots: { index: false, follow: false },
};

interface NotificationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

/**
 * Notification inbox (RSC) — PROJECT.md §9 module 17 / §8.16. The `(member)`
 * layout has already enforced the auth gate.
 *
 * Read path: pull the caller's notifications through the RLS-scoped server
 * client (a user only ever sees their own rows). The active tab lives in the URL
 * (`?tab=`) so the filtered view is shareable and stays server-rendered. Unread
 * count is computed from all rows (not the filtered slice). Marking read is
 * isolated to small client leaves (`NotificationItem`, `MarkAllReadButton`).
 *
 * Degrades gracefully: if the `notifications` table is not provisioned yet we
 * render a calm, designed empty state instead of erroring.
 */
export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const params = await searchParams;
  const activeTab: TabKey = resolveTab(firstParam(params.tab));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Badge-only hint; the inbox is not plan-gated. The server-side gate is
  // authoritative; the UI lock is a hint.
  const pro = isPro(await getViewerPlan());

  let rows: NotificationRow[] = [];
  let tableMissing = false;

  if (user) {
    const { data, error } = await supabase
      .from('notifications')
      .select(NOTIFICATION_SELECT_COLUMNS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      tableMissing = true;
    } else {
      rows = (data as NotificationRow[] | null) ?? [];
    }
  }

  const unreadCount = rows.filter((r) => !r.read_at).length;
  const visible =
    activeTab === 'all' ? rows : rows.filter((r) => r.category === activeTab);

  return (
    <div className="ntf">
      <header className="ntf-top">
        <a href="/dashboard" aria-label="FX Academy dashboard">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={pro ? 'lime-dark' : 'outline'}>{pro ? 'Pro' : 'Basic'}</Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="ntf-main" id="main">
        <div className="ntf-head">
          <div>
            <h1 className="h-md" style={{ margin: 0 }}>
              Notifications
            </h1>
            <p className="muted ntf-count" aria-live="polite">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          <MarkAllReadButton hasUnread={unreadCount > 0} />
        </div>

        <NotificationTabs active={activeTab} />

        {visible.length === 0 ? (
          <EmptyState tableMissing={tableMissing} tab={activeTab} />
        ) : (
          <ul className="ntf-list">
            {visible.map((row) => (
              <li key={row.id}>
                <NotificationItem row={row} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function EmptyState({ tableMissing, tab }: { tableMissing: boolean; tab: TabKey }) {
  return (
    <div className="ntf-empty">
      <div className="ntf-empty-icon" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      </div>
      <h2>{tab === 'all' ? "You're all caught up" : 'Nothing here yet'}</h2>
      <p className="muted">
        {tableMissing
          ? 'Notifications are being set up. Webinar reminders, trade ideas, replies, and progress updates will appear here.'
          : tab === 'all'
            ? 'When there is something to know — a webinar starting, a reply, or a milestone — it will show up here.'
            : 'No notifications in this category right now.'}
      </p>
    </div>
  );
}
