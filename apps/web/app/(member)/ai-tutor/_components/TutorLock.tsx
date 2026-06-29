import { Badge } from '@fxunlock/ui';

/**
 * Pro-gate locked state for the AI Tutor. The auth/entitlement decision is made
 * server-side in the page; this is the designed "upgrade" surface a Basic member
 * sees instead of the tutor. No conversation is started and no protected content
 * is rendered — the gate is enforced before any chat mounts (PROJECT.md §6.1: UI
 * locks are hints, the server is the source of truth; §7 🔒 Pro-only).
 *
 * Copy sells the learning value of the tutor without promising profit or giving
 * advice, and restates the hard limits up front.
 */
export function TutorLock() {
  return (
    <section className="tut-lock" aria-labelledby="tut-lock-h">
      <div className="tut-lock-hero">
        <span className="tut-lock-glow" aria-hidden="true" />
        <Badge tone="lime-dark">Pro feature</Badge>
        <h2 id="tut-lock-h" className="h-sm">
          A course-aware tutor that teaches, never tips
        </h2>
        <p>
          Ask about any concept in your current lesson, get quizzed, find your next topic, or reflect
          on a logged trade — grounded in the curriculum you are taking.
        </p>
      </div>
      <div className="tut-lock-body">
        <ul className="tut-lock-list">
          <li>Explain, Quiz me, What&rsquo;s next and Review a trade modes</li>
          <li>Answers grounded in your approved course content</li>
          <li>Educational only — never buy/sell, entry/exit or profit promises</li>
        </ul>
        <a href="/pricing" className="btn btn-lime btn-block btn-lg">
          Upgrade to Pro
        </a>
      </div>
    </section>
  );
}
