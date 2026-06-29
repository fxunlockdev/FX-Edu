import { PageHeader } from './PageHeader';

interface ComingSoonProps {
  /** Section name, used in the <h1>. */
  title: string;
  /** One-line summary of what this section will do (PROJECT.md §9 module 19). */
  summary: string;
}

/**
 * Placeholder body for admin sections whose UI is not built yet, so the nav
 * resolves without 404s. Renders a single <h1> via PageHeader plus a short
 * "section coming soon" panel describing the planned scope.
 */
export function ComingSoon({ title, summary }: ComingSoonProps) {
  return (
    <>
      <PageHeader title={title} />
      <section className="adm-soon" aria-label={`${title} — coming soon`}>
        <span className="adm-soon-badge">Section coming soon</span>
        <p className="adm-soon-copy">{summary}</p>
        <p className="adm-soon-note">
          When built, every mutation in this section is audited (§6.7) and dangerous
          actions require step-up + a reason note (§6.1).
        </p>
      </section>
    </>
  );
}
