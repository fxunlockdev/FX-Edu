import { Badge } from '@fxunlock/ui';

/**
 * Pro-gate locked state for Trade Ideas (M11 🔒 "Pro-only unless teaser
 * configured"). The auth/entitlement decision is made server-side in the page;
 * this is the designed "upgrade" surface a Basic member sees instead of the feed.
 * It leaks NO protected idea content — it describes the educational value and
 * links to upgrade, nothing more (PROJECT.md §6.1: UI locks are hints, the server
 * is the source of truth).
 *
 * Copy sells the coaching/learning value without promising profit, giving advice,
 * or implying the ideas are signals.
 */
export function UpgradeGate() {
  return (
    <section className="ti-gate" aria-labelledby="ti-gate-h">
      <div className="ti-gate-hero">
        <span className="ti-gate-glow" aria-hidden="true" />
        <Badge tone="lime-dark">Pro feature</Badge>
        <h2 id="ti-gate-h" className="h-sm">
          Learn how educators read the market
        </h2>
        <p>
          Trade Ideas are worked educational examples — how our educators analyze structure, context
          and risk on real instruments. Study the framework, not a call to copy.
        </p>
      </div>
      <div className="ti-gate-body">
        <ul className="ti-gate-list">
          <li>Educator-published examples with analysis notes, invalidation and objective</li>
          <li>Each idea mapped to a lesson or playbook so you learn the why</li>
          <li>Market news context and sample prices alongside every idea</li>
        </ul>
        <a href="/pricing" className="btn btn-lime btn-block btn-lg">
          Upgrade to Pro
        </a>
        <p className="ti-gate-fine muted" role="note">
          Educational examples only — not signals or financial advice.
        </p>
      </div>
    </section>
  );
}
