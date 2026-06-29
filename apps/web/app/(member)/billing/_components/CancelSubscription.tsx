'use client';

import { useState } from 'react';
import { Button } from '@fxunlock/ui';

interface CancelSubscriptionProps {
  /** Human label for when access ends, e.g. "May 18, 2026". */
  periodEndLabel: string | null;
  /** True once a cancel-at-period-end is already scheduled. */
  alreadyScheduled: boolean;
}

/**
 * Cancel-subscription flow (M16 / PROJECT.md §16) — UI is real, the ACTION is
 * STUBBED. Canceling retains access until the end of the current billing period
 * (✨ "cancel keeps access until period end"); progress is never lost.
 *
 * The destructive step is guarded by a confirm panel. Confirming does NOT mutate
 * anything yet — the real cancel runs through Stripe and is reflected only after
 * its webhook lands:
 *
 *   // TODO: wire cancel via Stripe (POST /billing/cancel → webhook-gated state)
 */
export function CancelSubscription({ periodEndLabel, alreadyScheduled }: CancelSubscriptionProps) {
  const [confirming, setConfirming] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  if (alreadyScheduled) {
    return (
      <p className="bill-cancel-scheduled" role="status">
        Cancellation scheduled. You keep full access
        {periodEndLabel ? ` until ${periodEndLabel}` : ' until the end of your billing period'}.
        You can resume anytime before then.
      </p>
    );
  }

  if (acknowledged) {
    return (
      <p className="bill-cancel-scheduled" role="status">
        Billing isn&rsquo;t live yet, so nothing was charged or changed. Once Stripe is
        connected, canceling here will keep your access
        {periodEndLabel ? ` until ${periodEndLabel}` : ' until the end of the period'}.
      </p>
    );
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        block
        className="bill-danger-btn"
        onClick={() => setConfirming(true)}
      >
        Cancel subscription
      </Button>
    );
  }

  return (
    <div className="bill-confirm" role="alertdialog" aria-labelledby="bill-confirm-title">
      <p id="bill-confirm-title" className="bill-confirm-title">
        Cancel your subscription?
      </p>
      <p className="bill-confirm-text muted">
        You&rsquo;ll keep full access
        {periodEndLabel ? ` until ${periodEndLabel}` : ' until the end of your billing period'} —
        no immediate loss of courses, journal or certificates. Your progress is always saved.
      </p>
      <div className="bill-confirm-actions">
        <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Keep my plan
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="bill-danger-btn"
          onClick={() => {
            // TODO: wire cancel via Stripe (POST /billing/cancel → webhook-gated state)
            setConfirming(false);
            setAcknowledged(true);
          }}
        >
          Confirm cancellation
        </Button>
      </div>
    </div>
  );
}
