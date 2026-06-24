import { Badge, Button } from '@fxunlock/ui';
import type { CurriculumTier } from './curriculum-data';
import { withRef } from './href';

interface TierCardProps {
  tier: CurriculumTier;
  /** 1-based position in the path. */
  index: number;
  /** Last tier hides the connecting rail line. */
  isLast: boolean;
  /** Sanitized referral code for ref-preserving CTAs. */
  refCode: string | null;
}

/**
 * One tier on the curriculum path: numbered rail node + a card describing what
 * the tier covers, its counts, plan access, certificate availability, and a
 * plan-aware CTA. Pro tiers shown to a default visitor render a "locked" hint —
 * a presentation cue only; real entitlements are enforced server-side.
 */
export function TierCard({ tier, index, isLast, refCode }: TierCardProps) {
  // Default visitor: Pro tiers display as locked Pro content (a hint, not a gate).
  const isLockedHint = tier.access === 'pro';
  const modulesLabelId = `tier-${tier.title.toLowerCase()}-modules`;

  return (
    <article className="tier" aria-labelledby={`tier-${tier.title.toLowerCase()}-title`}>
      <div className="tier-rail" aria-hidden="true">
        <div className={`tier-num${isLockedHint ? ' locked' : ''}`}>{index}</div>
        {!isLast && <div className="tier-line" />}
      </div>

      <div className={`tier-card card-hover${isLockedHint ? ' locked' : ''}`}>
        <header className="tier-head">
          <div>
            <h3 id={`tier-${tier.title.toLowerCase()}-title`} className="h-sm" style={{ margin: 0 }}>
              {tier.title}
            </h3>
            <div className="tier-sub">
              {tier.level} · {tier.moduleCount} modules · {tier.lessonCount} lessons · ~
              {tier.duration}
            </div>
          </div>

          <div className="tier-chips">
            {tier.access === 'basic' ? (
              <Badge tone="outline">Basic &amp; Pro</Badge>
            ) : (
              <Badge tone="lime">Included in Pro</Badge>
            )}
            {isLockedHint && (
              <Badge tone="warn">
                <span aria-hidden="true">🔒</span> Pro
              </Badge>
            )}
          </div>
        </header>

        <p className="tier-summary">{tier.summary}</p>

        <p id={modulesLabelId} className="eyebrow" style={{ margin: '18px 0 0' }}>
          What it covers
        </p>
        <ul className="modlist" aria-labelledby={modulesLabelId}>
          {tier.modules.map((mod) => (
            <li key={mod} className="mod">
              <span className="mk" aria-hidden="true" />
              {mod}
            </li>
          ))}
        </ul>

        <div className="tier-meta">
          {tier.certificate && (
            <Badge tone="outline">
              <span aria-hidden="true">🎓</span> Certificate available
            </Badge>
          )}
          {isLockedHint ? (
            <Button href={withRef('/checkout?plan=pro', refCode)} variant="forest" size="sm">
              Upgrade to Pro to unlock
            </Button>
          ) : (
            <Button href={withRef('/pricing', refCode)} variant="ghost" size="sm">
              See pricing
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
