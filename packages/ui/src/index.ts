// @fxunlock/ui — Lumina design system barrel.

// Utilities
export { cn } from './lib/cn';
export type { ClassValue } from './lib/cn';

// Components
export { Logo } from './components/logo/Logo';
export type { LogoVariant } from './components/logo/Logo';

export { Button } from './components/button/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/button/Button';

export { Container } from './components/container/Container';

export { SurfaceCard } from './components/surface-card/SurfaceCard';

export { Badge } from './components/badge/Badge';
export type { BadgeTone } from './components/badge/Badge';

export { Disclaimer, DISCLAIMER_TEXT } from './components/disclaimer/Disclaimer';
export type { DisclaimerKind } from './components/disclaimer/Disclaimer';

export { PublicNav } from './components/public-nav/PublicNav';
export { PUBLIC_NAV_LINKS } from './components/public-nav/nav-links';
export type { NavLink } from './components/public-nav/nav-links';

export { Footer } from './components/footer/Footer';
export { FOOTER_COLUMNS, FOOTER_LEGAL_LINKS } from './components/footer/footer-data';
export type { FooterColumn, FooterLink } from './components/footer/footer-data';

// Tailwind preset (also re-exported for programmatic use)
export { default as luminaPreset } from './tailwind-preset';
