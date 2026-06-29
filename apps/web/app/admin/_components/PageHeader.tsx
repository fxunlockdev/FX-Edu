import type { ReactNode } from 'react';

interface PageHeaderProps {
  /** The single <h1> for the page (one per page). */
  title: string;
  /** Optional one-line description under the title. */
  description?: string;
  /** Optional right-aligned actions (buttons, badges…). */
  actions?: ReactNode;
}

/**
 * Shared admin page header: enforces a single <h1> per page with an optional
 * description and a right-aligned actions slot. Semantic, responsive.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="adm-page-head">
      <div className="adm-page-head-text">
        <h1 className="adm-h1">{title}</h1>
        {description ? <p className="adm-page-desc">{description}</p> : null}
      </div>
      {actions ? <div className="adm-page-actions">{actions}</div> : null}
    </div>
  );
}
