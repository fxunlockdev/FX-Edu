// Partner portal navigation model — ported from the `PARTNER` preset in
// design/assets/shell.js into typed React data. Real `/partner/*` segments.

export interface PartnerNavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: PartnerIconName;
}

export type PartnerIconName =
  | 'overview'
  | 'branding'
  | 'domain'
  | 'book'
  | 'members'
  | 'revenue'
  | 'team'
  | 'settings';

/**
 * Single source of truth for the partner sidebar. Order + labels mirror the
 * M20 spec exactly. `href` values are real route segments under `/partner`.
 */
export const PARTNER_NAV: ReadonlyArray<PartnerNavItem> = [
  { label: 'Partner Overview', href: '/partner/overview', icon: 'overview' },
  { label: 'Branding', href: '/partner/branding', icon: 'branding' },
  { label: 'Domain', href: '/partner/domain', icon: 'domain' },
  { label: 'Course Library', href: '/partner/library', icon: 'book' },
  { label: 'Members', href: '/partner/members', icon: 'members' },
  { label: 'Revenue / Licensing', href: '/partner/revenue', icon: 'revenue' },
  { label: 'Team Access', href: '/partner/team', icon: 'team' },
  { label: 'Settings', href: '/partner/settings', icon: 'settings' },
];

/** SVG path data for the sidebar icons (mirrors shell.js `ICON`). */
export const PARTNER_ICON_PATHS: Record<PartnerIconName, string> = {
  overview: 'M3 3h8v8H3z M13 3h8v5h-8z M13 12h8v9h-8z M3 13h8v8H3z',
  branding: 'M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z',
  domain: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18',
  book: 'M5 4h14v16l-7-3-7 3z',
  members: 'M17 20a5 5 0 0 0-10 0 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 20a4 4 0 0 0-5-3.9',
  revenue: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  team: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M3 20a6 6 0 0 1 12 0 M17 11a3 3 0 1 0 0-6 M15 20a6 6 0 0 1 6 0',
  settings:
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.4-2.6H9.5L9 4a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L5 9a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h4.9l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4L19 13a7 7 0 0 0 0-1Z',
};

/**
 * Sample tenant the portal renders against until the real org/tenant is read
 * from the JWT/profile. NOTHING here is global FX Academy data — every value is
 * scoped to this one partner tenant, exactly as RLS would scope a live query.
 */
export interface PartnerTenant {
  readonly orgId: string;
  readonly name: string;
  readonly shortCode: string;
  readonly plan: 'Launch' | 'Growth' | 'Scale';
  readonly accentHex: string;
}

export const SAMPLE_TENANT: PartnerTenant = {
  orgId: 'org_sample_meridian',
  name: 'Meridian Trading Academy',
  shortCode: 'MT',
  plan: 'Growth',
  accentHex: '#2a6fdb',
};
