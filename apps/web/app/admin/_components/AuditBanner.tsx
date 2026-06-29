/**
 * Standing banner placed at the top of every admin work surface, restating the
 * §6.7 / §6.1 contract so it is impossible to miss: every mutation is audited,
 * and dangerous actions require step-up + a reason note.
 */
export function AuditBanner() {
  return (
    <aside className="adm-audit-banner" aria-label="Audit policy">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <span>
        <strong>Every admin action is audited</strong> (actor, action, target, metadata, IP,
        UA, timestamp). Dangerous actions — suspend, ban, impersonate, GDPR delete, refund,
        publish, role change — require <strong>step-up MFA</strong> and a reason note before
        they run.
      </span>
    </aside>
  );
}
