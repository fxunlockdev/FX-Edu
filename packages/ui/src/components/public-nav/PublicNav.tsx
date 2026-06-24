'use client';

import { useState } from 'react';
import { Logo } from '../logo/Logo';
import { cn } from '../../lib/cn';
import { PUBLIC_NAV_LINKS } from './nav-links';

interface PublicNavProps {
  /** Label of the active link (e.g. "Home") for the highlighted pill. */
  active?: string;
  /** When true, render a single "Go to Dashboard" CTA instead of Login/Join Pro. */
  loggedIn?: boolean;
  /** Dashboard href used when `loggedIn`. */
  dashboardHref?: string;
}

/**
 * Sticky glassmorphic public navigation — 8 marketing links, Login + Join Pro
 * CTAs, and a mobile burger that toggles the collapsed menu.
 * Ported from design/assets/shell.js `publicNav()`.
 */
export function PublicNav({
  active = 'Home',
  loggedIn = false,
  dashboardHref = '/dashboard',
}: PublicNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="pubnav sticky-top">
      <div className="wrap pubnav-inner">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={28} />
        </a>

        <nav className={cn('pubnav-links', open && 'open')} aria-label="Main navigation">
          {PUBLIC_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn('pubnav-link', link.label === active && 'active')}
              aria-current={link.label === active ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="row gap2">
          {loggedIn ? (
            <a href={dashboardHref} className="btn btn-forest btn-sm">
              Go to Dashboard
            </a>
          ) : (
            <>
              <a href="/login" className="pubnav-link">
                Login
              </a>
              <a href="/pricing" className="btn btn-lime btn-sm">
                Join Pro
              </a>
            </>
          )}
        </div>

        <button
          type="button"
          className="pubnav-burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}
