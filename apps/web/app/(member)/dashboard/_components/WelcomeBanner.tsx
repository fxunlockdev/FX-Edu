import { Badge } from '@fxunlock/ui';
import type { Plan } from '@/lib/entitlements/plan';

/**
 * Dashboard welcome banner (M18 / §18) — the dark hero strip with the plan
 * badge, greeting, streak + XP, and the primary CTA.
 *
 * Streak and XP are STUBBED placeholders: there is no progress/gamification
 * table yet (it lands with the learning modules), so the values are clearly
 * marked and framed as "—" rather than fabricated counts. They render so the
 * layout is true to the design and flip to real data when the table exists.
 */
interface WelcomeBannerProps {
  plan: Plan;
  greeting: string;
  name: string;
  /** New users get the "let's get set up" line; returning users get the focus line. */
  isNewUser: boolean;
}

export function WelcomeBanner({ plan, greeting, name, isNewUser }: WelcomeBannerProps) {
  // Pro surfaces unlock for Pro OR Elite; only Basic shows the upgrade CTA.
  const isPro = plan !== 'basic';

  return (
    <section className="mod dash-welcome col-12" aria-labelledby="dash-greeting">
      <span className="dash-glow dash-glow-lg" aria-hidden="true" />
      <div className="dash-welcome-inner">
        <div>
          <div className="row gap1 dash-welcome-chips">
            <Badge tone={isPro ? 'lime-dark' : 'outline'} className="dash-chip-on-dark">
              {isPro ? 'Pro' : 'Basic'}
            </Badge>
            {/* Streak + XP are placeholders until a progress table lands. */}
            <span className="chip dash-chip-stub" title="Streaks arrive with the learning modules">
              🔥 Streak —
            </span>
            <span className="chip dash-chip-stub" title="XP arrives with the learning modules">
              ⚡ XP —
            </span>
          </div>
          <h1 id="dash-greeting" className="h-md dash-greeting">
            {greeting}, {name}
          </h1>
          <p className="dash-welcome-sub">
            {isNewUser
              ? 'Let’s get you set up. Finish your checklist to unlock the full dashboard.'
              : 'You’re on track. Here’s what to focus on today.'}
          </p>
        </div>
        {isPro ? (
          <a href="/curriculum" className="btn btn-lime">
            Continue learning →
          </a>
        ) : (
          <a href="/pricing" className="btn btn-lime">
            Upgrade to Pro →
          </a>
        )}
      </div>
    </section>
  );
}
