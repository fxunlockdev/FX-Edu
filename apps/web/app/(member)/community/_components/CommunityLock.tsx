import { Badge } from '@fxunlock/ui';

/**
 * Pro-gate locked state for Community (PROJECT.md §12 🔒: Pro-only; Basic can't
 * read via direct URL — RLS + entitlement). The real gate is SERVER-SIDE: the
 * page returns this surface before any post query runs, and RLS blocks the rows
 * regardless. This UI lock is only a hint (§6.1).
 *
 * Copy sells the community's learning value without any signal/advice framing.
 */
export function CommunityLock() {
  return (
    <section className="cm-lock" aria-labelledby="cm-lock-h">
      <div className="cm-lock-hero">
        <span className="cm-lock-glow" aria-hidden="true" />
        <Badge tone="lime-dark">Pro feature</Badge>
        <h2 id="cm-lock-h" className="h-sm">
          Learn alongside other serious traders
        </h2>
        <p>
          The Community is a focused, moderated space to share reasoning, review your process,
          and stay accountable — never a signal room.
        </p>
      </div>
      <div className="cm-lock-body">
        <ul className="cm-lock-list">
          <li>Topic channels for TA, fundamentals, psychology, journaling and more</li>
          <li>Accountability pods of 6–10 traders with weekly goals and check-ins</li>
          <li>Educator-led discussion with active moderation</li>
        </ul>
        <a href="/pricing" className="btn btn-lime btn-block btn-lg">
          Upgrade to Pro
        </a>
      </div>
    </section>
  );
}
