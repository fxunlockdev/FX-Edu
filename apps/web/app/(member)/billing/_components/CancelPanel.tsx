import { CancelSubscription } from './CancelSubscription';
import type { BillingView } from './billing-data';

/**
 * Cancel-plan panel (RSC shell). Only meaningful with an active subscription —
 * on the Free state there is nothing to cancel, so we render nothing. The
 * destructive interaction itself lives in the `CancelSubscription` client leaf.
 */
export function CancelPanel({ view }: { view: BillingView }) {
  if (!view.hasSubscription) return null;

  const periodEndLabel = view.renewalLabel
    ? view.renewalLabel.replace(/^(Renews|Access ends)\s/, '')
    : null;

  return (
    <section className="bill-panel bill-panel-danger" aria-labelledby="bill-cancel-heading">
      <h3 id="bill-cancel-heading" className="bill-ph bill-ph-danger">
        Cancel plan
      </h3>
      <p className="bill-cancel-lead muted">
        Keep access until the end of your billing period. Your progress, journal and certificates
        are always saved.
      </p>
      <CancelSubscription periodEndLabel={periodEndLabel} alreadyScheduled={view.cancelScheduled} />
    </section>
  );
}
