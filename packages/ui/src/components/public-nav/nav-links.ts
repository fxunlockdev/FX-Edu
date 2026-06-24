/**
 * Public marketing nav links. Ported from design/assets/shell.js `PUB`.
 * The 8 primary destinations of the marketing site (PROJECT.md §9 module 1).
 */
export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export const PUBLIC_NAV_LINKS: ReadonlyArray<NavLink> = [
  { label: 'Home', href: '/' },
  { label: 'Curriculum', href: '/curriculum' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Webinars', href: '/webinars' },
  { label: 'Tools', href: '/tools' },
  { label: 'AI Learning', href: '/ai-learning' },
  { label: 'Affiliates', href: '/affiliates' },
  { label: 'Partners', href: '/partners' },
] as const;
