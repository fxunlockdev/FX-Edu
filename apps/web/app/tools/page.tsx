import type { Metadata } from 'next';
import { Footer, PublicNav } from '@fxunlock/ui';
import { ToolsHero, ToolkitGrid, MembershipCta } from './_sections';
import './_sections/tools.css';

export const metadata: Metadata = {
  title: 'Trading Tools',
  description:
    'Free, risk-first forex calculators: position sizing, risk/reward, pip value, P&L, correlation, session clock, and prop-firm risk mode. Educational tools only — never financial advice.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Trading Tools · FX Academy',
    description:
      'A suite of free calculators that put risk first. Size every position and know your exposure before you click buy.',
    url: '/tools',
  },
};

/**
 * Public Trading Tools page (PROJECT.md §9). Server component.
 * Renders PublicNav (active="Tools") + Footer. The seven-tool showcase is
 * fully static; only the Position Size calculator is a `'use client'` leaf.
 * The slippage/spread/execution disclaimer sits beside the tool, and the
 * canonical risk disclaimer lives in the Footer.
 */
export default function ToolsPage() {
  return (
    <>
      <PublicNav active="Tools" />

      <main id="main">
        <ToolsHero />
        <ToolkitGrid />
        <MembershipCta />
      </main>

      <Footer />
    </>
  );
}
