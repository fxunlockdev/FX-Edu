'use client';

import { Badge } from '@fxunlock/ui';
import type { Plan } from '@/lib/checkout/plan';

interface PlanPickerProps {
  plans: ReadonlyArray<Plan>;
  selectedId: Plan['id'];
  onSelect: (id: Plan['id']) => void;
}

/**
 * Plan selector (radiogroup). Mirrors the design's plan-pick cards; Pro is
 * flagged "Recommended". Keyboard + screen-reader friendly via role="radio".
 */
export function PlanPicker({ plans, selectedId, onSelect }: PlanPickerProps) {
  return (
    <div className="stack gap2" role="radiogroup" aria-label="Choose your plan">
      {plans.map((plan) => {
        const selected = plan.id === selectedId;
        return (
          <button
            key={plan.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? 'plan-pick sel' : 'plan-pick'}
            onClick={() => onSelect(plan.id)}
          >
            <span className="plan-radio" aria-hidden="true" />
            <span className="plan-pick-body">
              <span className="plan-pick-head">
                <strong>{plan.name}</strong>
                <span className="plan-pick-price">${plan.monthly}/mo</span>
              </span>
              <span className="plan-pick-desc muted">{planBlurb(plan.id)}</span>
              {plan.highlight && (
                <span style={{ display: 'inline-block', marginTop: 8 }}>
                  <Badge tone="lime">★ Recommended</Badge>
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function planBlurb(id: Plan['id']): string {
  switch (id) {
    case 'pro':
      return 'Full curriculum, webinars, AI, analytics, community';
    case 'basic':
      return 'Entry + Beginner courses, journal, risk calculator';
    case 'elite':
      return 'Everything in Pro, plus prop-firm prep and coaching';
  }
}
