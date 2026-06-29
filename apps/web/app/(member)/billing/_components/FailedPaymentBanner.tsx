import { ManagePlanButton } from './ManagePlanButton';

/**
 * Failed-payment recovery banner (designed state — PROJECT.md §16 ✨ "clear
 * failed-payment recovery"). Rendered only when the subscription status is
 * `past_due`. The "Update payment method" action routes through the Stripe
 * Customer Portal stub — recovery always happens in Stripe.
 */
export function FailedPaymentBanner({ renewalLabel }: { renewalLabel: string | null }) {
  return (
    <div className="bill-failed" role="alert">
      <div className="bill-failed-icon" aria-hidden="true">
        !
      </div>
      <div className="bill-failed-body">
        <p className="bill-failed-title">We couldn&rsquo;t process your last payment</p>
        <p className="bill-failed-text">
          Your access is still active for now{renewalLabel ? ` (${renewalLabel})` : ''}. Update your
          payment method in Stripe to avoid losing access — your subscription resumes automatically
          once a charge succeeds.
        </p>
      </div>
      <div className="bill-failed-action">
        <ManagePlanButton />
      </div>
    </div>
  );
}
