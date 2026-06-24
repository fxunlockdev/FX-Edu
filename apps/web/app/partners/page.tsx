import type { Metadata } from 'next';
import { PublicNav, Footer } from '@fxunlock/ui';
import {
  WlHero,
  WlFeatures,
  WlAudience,
  WlOnboarding,
  WlRevenue,
  WlDemoCta,
} from './_sections';
import './_sections/partners.css';

export const metadata: Metadata = {
  title: 'Partners — Launch a White-Label Trading Academy',
  description:
    'White-label FX Academy under your own brand, colors and domain. Prop firms, educators and brokers can launch a branded, education-first trading academy with our curriculum engine, tools, member dashboard, and flexible licensing or revenue share.',
  openGraph: {
    title: 'Partners — Launch a White-Label Trading Academy · FX Academy',
    description:
      'Launch a branded, education-first trading academy on a proven platform — your brand, your domain, our curriculum engine and tools.',
  },
};

/**
 * Partners (White-Label) landing page. Server component; the only interactive
 * leaf is the stubbed demo form inside <WlDemoCta />. Ported from
 * design/public/whitelabel-landing.html and built on the Lumina design system.
 */
export default function PartnersPage() {
  return (
    <>
      <PublicNav active="Partners" />

      <main id="main">
        <WlHero />
        <WlFeatures />
        <WlAudience />
        <WlOnboarding />
        <WlRevenue />
        <WlDemoCta />
      </main>

      <Footer />
    </>
  );
}
