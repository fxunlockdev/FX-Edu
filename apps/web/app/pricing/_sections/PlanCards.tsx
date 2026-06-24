'use client';

import { useState } from 'react';
import { Badge, Button } from '@fxunlock/ui';
import { PLANS, type Plan } from './plans';
import { CheckIcon, CrossIcon } from './icons';
import { withRef } from './href';

interface PlanCardsProps {
  /** Already-sanitized referral code forwarded onto every CTA. */
  refCode: string | null;
}

type Billing = 'monthly' | 'yearly';

/**
 * Interactive pricing grid (the one `'use client'` leaf on this page).
 *
 * Owns the monthly/yearly billing toggle, which is local UI state only. The
 * three plan cards re-render with the matching price. Pro is highlighted;
 * Elite is pre-launch ("from" floor + waitlist CTA). Every CTA preserves the
 * plan id and any `?ref=` code via `withRef`.
 */
export function PlanCards({ refCode }: PlanCardsProps) {
  const [billing, setBilling] = useState<Billing>('monthly');
  const yearly = billing === 'yearly';

  return (
    <div className="price-page">
      <div
        className="pp-toggle"
        role="group"
        aria-label="Billing period"
      >
        <button
          type="button"
          className={billing === 'monthly' ? 'on' : undefined}
          aria-pressed={billing === 'monthly'}
          onClick={() => setBilling('monthly')}
        >
          Monthly
        </button>
        <button
          type="button"
          className={billing === 'yearly' ? 'on' : undefined}
          aria-pressed={billing === 'yearly'}
          onClick={() => setBilling('yearly')}
        >
          Yearly · save 20%
        </button>
      </div>

      <div className="pp-plans">
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} yearly={yearly} refCode={refCode} />
        ))}
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: Plan;
  yearly: boolean;
  refCode: string | null;
}

function PlanCard({ plan, yearly, refCode }: PlanCardProps) {
  const price = yearly ? plan.yearly : plan.monthly;
  const href = withRef(plan.href, refCode);
  const headingId = `plan-${plan.id}-name`;

  const variant = plan.highlight ? 'lime' : plan.comingSoon ? 'ghost' : 'forest';

  return (
    <article
      className={`pp-plan${plan.highlight ? ' pp-plan-hero' : ''}`}
      aria-labelledby={headingId}
    >
      {plan.highlight && <div className="pp-ribbon">★ Most popular</div>}

      <div className="between">
        <h3
          id={headingId}
          className="eyebrow"
          style={plan.highlight ? { color: 'var(--primary)' } : undefined}
        >
          {plan.name}
        </h3>
        {plan.comingSoon && <Badge tone="warn">Coming soon</Badge>}
      </div>

      <p className="pp-price num">
        {plan.comingSoon && <span className="pp-price-from">From</span>}$
        {plan.comingSoon ? plan.monthly : price}
        <span className="pp-price-period">/mo</span>
      </p>

      <p className="muted pp-sub">
        {plan.sub}
        {yearly && !plan.comingSoon ? ' · billed yearly' : ''}
      </p>

      <Button href={href} variant={variant} block>
        {plan.cta}
      </Button>

      <hr className="divider pp-plan-divider" />

      <ul className="pp-feats">
        {plan.features.map((feature) => (
          <li
            key={feature.label}
            className={feature.included ? 'pp-feat' : 'pp-feat pp-feat-off'}
          >
            {feature.included ? <CheckIcon /> : <CrossIcon />}
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
