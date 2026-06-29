import { Badge } from '@fxunlock/ui';
import { ELITE_BENEFITS } from './elite-data';
import type { EliteTier } from './plan';

/**
 * The not-Elite surface for Elite Cohort & Coaching (M21 / PROJECT.md §9 module
 * 21). Elite is COMING SOON (§5: "Elite from $147 waitlist"), so a member who is
 * not entitled sees this designed waitlist/upgrade state instead of any Elite
 * content.
 *
 * The server gate in the page renders THIS instead of the Elite sections, so no
 * coaching calls, Q&A library, or early-access items leak (PROJECT.md §6.1: UI
 * locks are hints; the server decides). This component reads no protected data —
 * it only previews the value proposition and captures waitlist intent.
 *
 * Education-only copy: it sells the high-touch learning experience, never a
 * trading or evaluation outcome (§6.7).
 */
export function WaitlistGate({ tier }: { tier: EliteTier }) {
  const proAlready = tier === 'pro';
  return (
    <section className="el-wait" aria-labelledby="el-wait-h">
      <div className="el-wait-hero">
        <span className="el-wait-glow" aria-hidden="true" />
        <Badge tone="lime-dark">Coming soon · from $147/mo</Badge>
        <h2 id="el-wait-h" className="h-sm">
          Elite coaching is on the way
        </h2>
        <p>
          {proAlready
            ? 'You are already on Pro. Elite is the next step up — a smaller, high-touch cohort with live coaching. Join the waitlist to be first in when it opens.'
            : 'Elite is our most hands-on tier: monthly live coaching, direct educator Q&A, and early access to new content in a small, committed cohort. Join the waitlist for early access.'}
        </p>
      </div>

      <div className="el-wait-body">
        <h3 className="el-wait-sub">What you will get with Elite</h3>
        <ul className="el-wait-list">
          {ELITE_BENEFITS.map((benefit) => (
            <li key={benefit.id}>
              <span className="el-wait-tick" aria-hidden="true">
                ✓
              </span>
              <span>
                <strong>{benefit.title}.</strong> {benefit.detail}
              </span>
            </li>
          ))}
        </ul>

        <div className="el-wait-actions">
          {/* TODO: capture Elite waitlist intent (PROJECT.md §8.2 "Elite waitlist
              capture"). Until that endpoint exists, point at pricing where the
              waitlist signup lives. */}
          <a href="/pricing#elite" className="btn btn-lime btn-lg">
            Join the Elite waitlist
          </a>
          <a href="/pricing" className="btn btn-ghost btn-lg">
            Compare plans
          </a>
        </div>

        <p className="el-wait-note muted">
          Elite is launching soon from $147/mo. Joining the waitlist does not charge you or guarantee
          a trading or evaluation outcome — FX Academy provides education and tools only.
        </p>
      </div>
    </section>
  );
}
