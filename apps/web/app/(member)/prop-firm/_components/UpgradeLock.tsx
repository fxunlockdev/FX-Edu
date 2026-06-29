import { Badge } from '@fxunlock/ui';

/**
 * Pro-gate locked state for Prop Firm Prep (M13 / PROJECT.md §8.13). The
 * auth/entitlement decision is made server-side in the page; this is the
 * designed "upgrade" surface a Basic member sees instead of the prep tools. No
 * readiness data is read or rendered here — the gate is enforced before any
 * trade query runs (PROJECT.md §6.1: UI locks are hints, the server decides).
 *
 * Copy sells the discipline value of the track without promising that it will
 * make anyone pass an evaluation.
 */
export function UpgradeLock() {
  return (
    <section className="pf-lock" aria-labelledby="pf-lock-h">
      <div className="pf-lock-hero">
        <span className="pf-lock-glow" aria-hidden="true" />
        <Badge tone="lime-dark">Pro feature</Badge>
        <h2 id="pf-lock-h" className="h-sm">
          Get evaluation-ready, the disciplined way
        </h2>
        <p>
          A structured path to prepare for a funded-account evaluation: model the drawdown rules,
          build a compliant routine, and check your trades against your own configured limits.
        </p>
      </div>
      <div className="pf-lock-body">
        <ul className="pf-lock-list">
          <li>A readiness read built from your own journal discipline</li>
          <li>A four-stage prep path and an evaluation-day checklist</li>
          <li>Configurable constraints checked live by the risk engine</li>
        </ul>
        <a href="/pricing" className="btn btn-lime btn-block btn-lg">
          Upgrade to Pro
        </a>
        <p className="pf-lock-note muted">
          Preparation only. FX Academy does not guarantee that you will pass any prop-firm
          evaluation.
        </p>
      </div>
    </section>
  );
}
