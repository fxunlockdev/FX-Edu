/**
 * Affiliate portal navigation config + role-gate helper.
 *
 * The nav mirrors the `AFFILIATE` preset from `design/assets/shell.js` exactly:
 * Overview, Referral Link, Commissions, Payouts, Promo Assets, Settings — each
 * pointing at a real `/affiliate/*` route segment (not the design package's flat
 * `.html` files).
 */

export interface AffiliateNavItem {
  /** Visible label (matches the design package preset). */
  label: string;
  /** App-relative route segment. */
  href: string;
  /** Icon key from {@link NAV_ICON}. */
  icon: AffiliateNavIcon;
}

export type AffiliateNavIcon =
  | 'overview'
  | 'link'
  | 'revenue'
  | 'payout'
  | 'asset'
  | 'settings';

/**
 * Single-group sidebar. Ported from `shell.js` → `AFFILIATE`:
 *   Overview · Referral Link · Commissions · Payouts · Promo Assets · Settings
 */
export const AFFILIATE_NAV: ReadonlyArray<AffiliateNavItem> = [
  { label: 'Overview', href: '/affiliate/overview', icon: 'overview' },
  { label: 'Referral Link', href: '/affiliate/referral', icon: 'link' },
  { label: 'Commissions', href: '/affiliate/commissions', icon: 'revenue' },
  { label: 'Payouts', href: '/affiliate/payouts', icon: 'payout' },
  { label: 'Promo Assets', href: '/affiliate/assets', icon: 'asset' },
  { label: 'Settings', href: '/affiliate/settings', icon: 'settings' },
] as const;

/**
 * SVG path data ported verbatim from `shell.js`'s `ICON` map for the keys the
 * affiliate surface uses. Each path is drawn inside a 24×24 stroke viewbox.
 */
export const NAV_ICON: Record<AffiliateNavIcon, string> = {
  overview: 'M3 3h8v8H3z M13 3h8v5h-8z M13 12h8v9h-8z M3 13h8v8H3z',
  link: 'M9 15l6-6 M10 6l1-1a4 4 0 0 1 6 6l-1 1 M14 18l-1 1a4 4 0 0 1-6-6l1-1',
  revenue: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  payout: 'M3 7h18v10H3z M3 11h18 M7 15h3',
  asset: 'M4 5h16v14H4z M4 15l4-4 3 3 5-5 4 4',
  settings:
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.4-2.6H9.5L9 4a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L5 9a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h4.9l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4L19 13a7 7 0 0 0 0-1Z',
};

/**
 * Pure server-side role gate.
 *
 * SECURITY (PROJECT.md §6.1 — "Server-side authorization always; UI locks are
 * hints only"): the affiliate portal is **default-DENY**. A visitor must hold the
 * `affiliate` role/membership before any portal route renders; everyone else is
 * redirected. We model that decision here as a pure predicate so the layout's
 * gate is trivial and testable.
 *
 * No affiliate role/membership source is runtime-wired yet, so this returns
 * `false` for everyone — the layout redirects to the public affiliate landing.
 * When the JWT/profile claim lands, this single predicate flips and the whole
 * portal unlocks without touching any page.
 *
 * @param _claims reserved — will receive the verified JWT claims / profile row.
 * @returns whether the caller may access the affiliate portal.
 */
export function hasAffiliateRole(_claims: AffiliateRoleClaims | null): boolean {
  // TODO: read affiliate role/membership from JWT/profile (claims.role === 'affiliate'
  // or an approved row in `affiliates`). Until then, default DENY.
  return false;
}

/** Shape the role gate will read once entitlements are wired. */
export interface AffiliateRoleClaims {
  role?: string | null;
  affiliateStatus?: 'pending' | 'approved' | 'rejected' | null;
}
