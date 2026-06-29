/**
 * Notification inbox field model (PROJECT.md §8.16). Single source of truth for
 * the tab set, the row→category mapping, and the icon/kind treatments shared by
 * the RSC page, the read-on-click leaf, and the mark-all-read action.
 *
 * `category` maps a row to an inbox tab; `kind` selects the row's icon/colour.
 * Both mirror the columns in `settings.schema.sql` (`notifications`).
 */

export type NotificationCategory = 'webinars' | 'community' | 'progress';

/** Tab keys are the URL state. `all` is the union of every category. */
export type TabKey = 'all' | NotificationCategory;

export const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'webinars', label: 'Webinars' },
  { key: 'community', label: 'Community' },
  { key: 'progress', label: 'Progress' },
] as const;

// Typed as `Set<string>` so `.has(value)` accepts an untrusted string without a
// cast; the single `as TabKey` on the return is justified by the membership check.
const TAB_KEYS = new Set<string>(TABS.map((t) => t.key));

/** Coerce an untrusted `?tab=` value to a valid tab key (defaults to 'all'). */
export function resolveTab(value: string | null | undefined): TabKey {
  return value && TAB_KEYS.has(value) ? (value as TabKey) : 'all';
}

/**
 * Row icon/colour treatments keyed by `kind`. Tones reference Lumina-aligned
 * values; the SVG path is the inline glyph. An unknown kind falls back to the
 * neutral community treatment so a new server-side kind never breaks the inbox.
 */
export interface KindStyle {
  readonly tone: 'live' | 'idea' | 'community' | 'cert';
  readonly path: string;
}

/** Neutral default used for any kind the server adds that the client doesn't
 *  recognise yet — a new `kind` value never breaks the inbox render. */
const DEFAULT_KIND_STYLE: KindStyle = {
  tone: 'community',
  path: 'M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.3A8.4 8.4 0 1 1 21 11.5Z',
};

export const KIND_STYLES: Record<string, KindStyle> = {
  live: {
    tone: 'live',
    path: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M5 12a7 7 0 0 1 14 0',
  },
  idea: {
    tone: 'idea',
    path: 'M9 18h6M10 21h4M12 2a7 7 0 0 1 4 12.7c-.7.5-1 .9-1 1.8H9c0-.9-.3-1.3-1-1.8A7 7 0 0 1 12 2Z',
  },
  reply: DEFAULT_KIND_STYLE,
  reaction: DEFAULT_KIND_STYLE,
  cert: {
    tone: 'cert',
    path: 'M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M9 14l-2 7 5-3 5 3-2-7',
  },
} as const;

export function kindStyle(kind: string): KindStyle {
  return KIND_STYLES[kind] ?? DEFAULT_KIND_STYLE;
}

/** A notification row as the inbox reads it (snake_case from the DB). */
export interface NotificationRow {
  readonly id: string;
  readonly category: string;
  readonly kind: string;
  readonly title: string;
  readonly body: string | null;
  readonly read_at: string | null;
  readonly created_at: string | null;
}

export const NOTIFICATION_SELECT_COLUMNS =
  'id, category, kind, title, body, read_at, created_at';

/** Compact relative-time label, e.g. "30m", "2h", "1d". */
export function relativeTime(iso: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const diffMs = Date.now() - then;
  if (diffMs < 0) return 'now';
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  return `${wk}w`;
}
