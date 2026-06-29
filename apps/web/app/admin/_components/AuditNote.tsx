import type { ReactNode } from 'react';

interface AuditNoteProps {
  /** When true, renders the stronger "dangerous action" treatment. */
  danger?: boolean;
  children: ReactNode;
}

/**
 * Inline "audited action" note shown beside every mutation control. Makes the
 * §6.7 contract visible in the UI itself: standard actions are audited;
 * `danger` actions additionally require step-up + a reason note (§6.1 / §6.7).
 */
export function AuditNote({ danger = false, children }: AuditNoteProps) {
  return (
    <p className={`adm-audit-note${danger ? ' is-danger' : ''}`} role="note">
      <svg
        viewBox="0 0 24 24"
        width="13"
        height="13"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {danger ? (
          <>
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </>
        ) : (
          <>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <path d="M9 12l2 2 4-4" />
          </>
        )}
      </svg>
      <span>{children}</span>
    </p>
  );
}
