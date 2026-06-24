import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Manrope } from 'next/font/google';
// Lumina tokens + base styles first, then app globals (Tailwind layers).
import '@fxunlock/ui/styles/tokens.css';
import './globals.css';

/**
 * Lumina type families loaded via next/font (self-hosted, no layout shift).
 * Exposed as CSS variables that `tokens.css` reads through --font-display/body.
 */
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fxacademy.example'),
  title: {
    default: 'FX Academy — Master Forex Trading the Right Way',
    template: '%s · FX Academy',
  },
  description:
    'FX Academy is an education-first forex learning platform: structured courses, live webinars, a course-aware AI tutor, journaling, analytics, and built-in trading tools. Educational content only — never financial advice.',
  applicationName: 'FX Academy',
  keywords: [
    'forex education',
    'trading courses',
    'trading journal',
    'risk management',
    'trading webinars',
    'forex curriculum',
  ],
  openGraph: {
    type: 'website',
    siteName: 'FX Academy',
    title: 'FX Academy — Master Forex Trading the Right Way',
    description:
      'Structured forex education, live guidance, AI support, and built-in trading tools, in one disciplined platform.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0f3218',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hanken.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
