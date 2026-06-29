import type { ReactNode } from 'react';
import { Logo, Badge } from '@fxunlock/ui';
import { SignOutButton } from '../../(member)/_components/SignOutButton';
import { AFFILIATE_NAV, NAV_ICON, type AffiliateNavIcon } from './nav';

/**
 * Affiliate portal chrome — a server component that ports the `appSidebar`,
 * `appTop` and `appStyles` structures from `design/assets/shell.js` into React.
 *
 * Layout: a dark, sticky 248px sidebar (single nav group, lime active state) +
 * a light, blurred sticky topbar with page title, plan badge and sign-out. The
 * active item is matched against the route's `active` label. The whole grid +
 * styling lives in `affiliate.css` (the `appStyles` port), so this component is
 * pure markup.
 */
interface AffiliateShellProps {
  /** Label of the active nav item (must match an `AFFILIATE_NAV.label`). */
  active: string;
  /**
   * Topbar label. Rendered as a non-heading element so each page keeps its own
   * single `<h1>` in the body (one h1 per page).
   */
  title: string;
  children: ReactNode;
}

/** Render a stroke icon from the ported `shell.js` ICON map. */
function NavIcon({ name }: { name: AffiliateNavIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {NAV_ICON[name].split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : `M${seg}`} />
      ))}
    </svg>
  );
}

export function AffiliateShell({ active, title, children }: AffiliateShellProps) {
  return (
    <div className="aff">
      <aside className="aff-side" aria-label="Affiliate navigation">
        <div className="aff-side-top">
          <a href="/affiliate/overview" aria-label="FX Academy affiliate portal">
            <Logo variant="light" size={26} />
          </a>
        </div>
        <nav className="aff-nav">
          <div className="aff-nav-sec">Affiliate</div>
          {AFFILIATE_NAV.map((item) => {
            const isActive = item.label === active;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`aff-nav-item${isActive ? ' active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="aff-nav-ic">
                  <NavIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="aff-side-foot">
          <Badge tone="lime-dark" dot>
            Affiliate
          </Badge>
        </div>
      </aside>

      <div className="aff-content">
        <header className="aff-top">
          <span className="aff-top-title">{title}</span>
          <div className="row gap2" style={{ alignItems: 'center' }}>
            <a href="/dashboard" className="btn btn-ghost btn-sm">
              Member area
            </a>
            <SignOutButton />
          </div>
        </header>

        <main className="aff-body" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
