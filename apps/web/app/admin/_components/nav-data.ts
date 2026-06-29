/**
 * Admin sidebar navigation model — ported from the `ADMIN` preset in
 * `design/assets/shell.js`, rewritten to resolve real `/admin/*` segment URLs
 * (PROJECT.md §9 module 19 screen list). Each section groups labelled links;
 * `icon` keys map into `nav-icons.tsx`.
 */

export interface AdminNavLink {
  label: string;
  href: string;
  icon: AdminIconName;
}

export interface AdminNavSection {
  /** Section heading; empty string renders an unlabelled top group. */
  heading: string;
  links: readonly AdminNavLink[];
}

export type AdminIconName =
  | 'overview'
  | 'members'
  | 'courses'
  | 'lessons'
  | 'webinars'
  | 'ideas'
  | 'ai'
  | 'mod'
  | 'affiliates'
  | 'revenue'
  | 'whitelabel'
  | 'crm'
  | 'settings';

/**
 * The full ADMIN nav (Overview, Members, Courses, Lessons, Webinars, Trade
 * Ideas, AI Knowledge, Community Mod, Affiliates, Revenue, White-label,
 * CRM/Integrations, Settings). Frozen as a readonly constant — immutable data.
 */
export const ADMIN_NAV: readonly AdminNavSection[] = [
  {
    heading: '',
    links: [
      { label: 'Overview', href: '/admin/overview', icon: 'overview' },
      { label: 'Members', href: '/admin/members', icon: 'members' },
      { label: 'Courses', href: '/admin/courses', icon: 'courses' },
      { label: 'Lessons', href: '/admin/lessons', icon: 'lessons' },
      { label: 'Webinars', href: '/admin/webinars', icon: 'webinars' },
      { label: 'Trade Ideas', href: '/admin/trade-ideas', icon: 'ideas' },
    ],
  },
  {
    heading: 'Platform',
    links: [
      { label: 'AI Knowledge', href: '/admin/ai-knowledge', icon: 'ai' },
      { label: 'Community Mod', href: '/admin/community', icon: 'mod' },
      { label: 'Affiliates', href: '/admin/affiliates', icon: 'affiliates' },
      { label: 'Revenue', href: '/admin/revenue', icon: 'revenue' },
      { label: 'White-label', href: '/admin/white-label', icon: 'whitelabel' },
      { label: 'CRM / Integrations', href: '/admin/crm', icon: 'crm' },
      { label: 'Settings', href: '/admin/settings', icon: 'settings' },
    ],
  },
] as const;
