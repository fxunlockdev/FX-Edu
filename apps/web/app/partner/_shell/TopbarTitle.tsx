'use client';

import { usePathname } from 'next/navigation';
import { PARTNER_NAV } from './nav';

/**
 * Active-route title for the topbar. Isolated client leaf — it only needs the
 * live pathname; everything else in the topbar stays server-rendered.
 */
export function TopbarTitle() {
  const pathname = usePathname();
  return <span className="pt-top-title">{resolveTitle(pathname)}</span>;
}

function resolveTitle(pathname: string | null): string {
  if (!pathname) return 'Partner Portal';
  const match = PARTNER_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.label ?? 'Partner Portal';
}
