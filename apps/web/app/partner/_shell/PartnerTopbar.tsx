import { Badge } from '@fxunlock/ui';
import { SignOutButton } from './SignOutButton';
import { TopbarTitle } from './TopbarTitle';
import type { PartnerTenant } from './nav';

interface PartnerTopbarProps {
  readonly tenant: PartnerTenant;
}

/**
 * Partner portal topbar — ported from `appTop` in design/assets/shell.js.
 * Server component: only the active-route title is a client leaf (TopbarTitle).
 * Search is a static affordance — no command palette is wired. Sign-out reuses
 * the POST form so it works without client JS.
 */
export function PartnerTopbar({ tenant }: PartnerTopbarProps) {
  return (
    <header className="pt-top">
      <div className="pt-top-left">
        <TopbarTitle />
        <span className="pt-search" role="search" aria-label="Search (preview)">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <span>Search this tenant…</span>
        </span>
      </div>

      <div className="pt-top-right">
        <Badge tone="lime-dark">{tenant.plan} license</Badge>
        <span className="pt-avatar" title={tenant.name} aria-hidden="true">
          {tenant.shortCode}
        </span>
        <SignOutButton />
      </div>
    </header>
  );
}
