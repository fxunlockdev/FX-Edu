'use client';

import { usePathname } from 'next/navigation';
import { Logo } from '@fxunlock/ui';
import { PARTNER_NAV, PARTNER_ICON_PATHS, type PartnerNavItem, type PartnerTenant } from './nav';

interface PartnerSidebarProps {
  readonly tenant: PartnerTenant;
}

/**
 * Partner portal sidebar — ported from the `PARTNER` nav preset + `appSidebar`
 * in design/assets/shell.js. The active item is derived from the live pathname
 * (so navigation highlights without prop drilling). This is the only reason the
 * sidebar is a client leaf; everything it renders is static, tenant-scoped data.
 */
export function PartnerSidebar({ tenant }: PartnerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="pt-side" aria-label="Partner portal navigation">
      <div className="pt-side-top">
        <Logo variant="light" size={26} />
        <p className="pt-tenant">
          <span className="pt-tenant-name">{tenant.name}</span>
          <span className="pt-tenant-meta">
            White-label tenant · {tenant.plan}
          </span>
        </p>
      </div>

      <nav className="pt-nav">
        {PARTNER_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="pt-side-foot">
        <span className="pt-iso-badge" aria-hidden="true">
          <ShieldIcon />
        </span>
        <p>
          Tenant-isolated workspace. You see only{' '}
          <strong>{tenant.name}</strong> data — never global FX Academy admin.
        </p>
      </div>
    </aside>
  );
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active }: { item: PartnerNavItem; active: boolean }) {
  return (
    <a
      href={item.href}
      className={active ? 'pt-nav-item active' : 'pt-nav-item'}
      aria-current={active ? 'page' : undefined}
    >
      <span className="pt-nav-ic" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          width="19"
          height="19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={PARTNER_ICON_PATHS[item.icon]} />
        </svg>
      </span>
      <span>{item.label}</span>
    </a>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
