'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@fxunlock/ui';
import { ADMIN_NAV } from './nav-data';
import { NavIcon } from './nav-icons';

/**
 * Dark admin sidebar — ported from `appSidebar` + the `ADMIN` preset in
 * `design/assets/shell.js`. Client leaf only because it reads `usePathname()` to
 * highlight the active route; it holds no privileged data (the server layout
 * already gated access). Styling lives in `admin.css`.
 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="adm-side" aria-label="Admin navigation">
      <div className="adm-side-top">
        <Link href="/admin/overview" aria-label="FX Academy admin home">
          <Logo variant="light" size={26} />
        </Link>
        <span className="adm-side-tag">Console</span>
      </div>

      <nav className="adm-nav">
        {ADMIN_NAV.map((section) => (
          <div key={section.heading || 'top'} className="adm-nav-group">
            {section.heading ? <p className="adm-nav-sec">{section.heading}</p> : null}
            {section.links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`adm-nav-item${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="adm-nav-ic">
                    <NavIcon name={link.icon} />
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="adm-side-foot">
        <p className="adm-side-foot-note">
          {/* Persistent reminder of the §6.7 contract, visible to every operator. */}
          Every action is audited. Dangerous actions require step-up.
        </p>
      </div>
    </aside>
  );
}
