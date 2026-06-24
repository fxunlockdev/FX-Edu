/** Footer link columns. Ported from design/assets/shell.js `footer()`. */
export interface FooterLink {
  readonly label: string;
  readonly href: string;
}

export interface FooterColumn {
  readonly heading: string;
  readonly links: ReadonlyArray<FooterLink>;
}

export const FOOTER_COLUMNS: ReadonlyArray<FooterColumn> = [
  {
    heading: 'Platform',
    links: [
      { label: 'Curriculum', href: '/curriculum' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Live Webinars', href: '/webinars' },
      { label: 'Trading Tools', href: '/tools' },
      { label: 'AI Learning', href: '/ai-learning' },
    ],
  },
  {
    heading: 'Programs',
    links: [
      { label: 'Prop Firm Prep', href: '/prop-firm' },
      { label: 'Strategy Library', href: '/strategies' },
      { label: 'Certificates', href: '/certificates' },
      { label: 'Free Education', href: '/curriculum' },
    ],
  },
  {
    heading: 'Business',
    links: [
      { label: 'Affiliates', href: '/affiliates' },
      { label: 'Partners', href: '/partners' },
      { label: 'For Teams', href: '/partners' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
] as const;

export const FOOTER_LEGAL_LINKS: ReadonlyArray<FooterLink> = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Risk Disclosure', href: '/risk-disclosure' },
  { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
] as const;
