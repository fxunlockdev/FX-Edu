import type { ReactNode } from 'react';

interface PageHeaderProps {
  readonly title: string;
  readonly lead?: string;
  /** Optional trailing controls (buttons, badges). */
  readonly actions?: ReactNode;
}

/** Single h1 per page + optional lead + actions. Shared across partner pages. */
export function PageHeader({ title, lead, actions }: PageHeaderProps) {
  return (
    <div className="pt-page-head">
      <div>
        <h1 className="h-md">{title}</h1>
        {lead ? <p className="pt-lead muted">{lead}</p> : null}
      </div>
      {actions ? <div className="row gap2">{actions}</div> : null}
    </div>
  );
}

/**
 * Reusable tenant-isolation reminder. Every partner page can drop this in to
 * keep the RLS framing visible: a partner admin only ever sees their own
 * tenant's data, never another partner's and never global FX Academy admin.
 */
export function TenantIsolationNote({ tenantName }: { tenantName: string }) {
  return (
    <p className="pt-iso-note" role="note">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <span>
        Tenant-isolated view. Every figure here is scoped to{' '}
        <strong>{tenantName}</strong> by Postgres RLS (each row carries{' '}
        <code>org_id</code>; policies read the <code>org_id</code> JWT claim). You
        cannot read another partner&rsquo;s data or the global FX Academy admin.
      </span>
    </p>
  );
}
