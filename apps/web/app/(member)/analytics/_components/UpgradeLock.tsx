import { Badge } from '@fxunlock/ui';

/**
 * Pro-gate locked state. The auth/entitlement decision is made server-side in
 * the page; this is the designed "upgrade" surface a Basic member sees instead
 * of the dashboard. No analytics data is read or rendered here — the gate is
 * enforced before any trade query runs (PROJECT.md §6.1: UI locks are hints,
 * the server is the source of truth).
 *
 * Copy sells the coaching value of the feature without promising profit or
 * giving advice.
 */
export function UpgradeLock() {
  return (
    <section className="ana-lock" aria-labelledby="ana-lock-h">
      <div className="ana-lock-hero">
        <span className="ana-lock-glow" aria-hidden="true" />
        <Badge tone="lime-dark">Pro feature</Badge>
        <h2 id="ana-lock-h" className="h-sm">
          Turn your journal into a coaching dashboard
        </h2>
        <p>
          See win rate by pair, session, setup and trading behavior. Spot your edges and your
          leaks, then turn insight into rules you actually follow.
        </p>
      </div>
      <div className="ana-lock-body">
        <ul className="ana-lock-list">
          <li>Win rate by session, day of week, setup and pair</li>
          <li>Cumulative R over time and a consistency read</li>
          <li>Data-derived insights on your strongest windows and leaks</li>
        </ul>
        <a href="/pricing" className="btn btn-lime btn-block btn-lg">
          Upgrade to Pro
        </a>
      </div>
    </section>
  );
}
