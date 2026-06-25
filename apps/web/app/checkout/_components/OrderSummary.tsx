import { SurfaceCard, Badge } from '@fxunlock/ui';
import type { Plan } from '@/lib/checkout/plan';

interface OrderSummaryProps {
  plan: Plan;
  /** Sanitized referral code, if present. */
  refCode: string | null;
}

/**
 * Order summary card. Presentational — shows the selected plan, monthly price,
 * and a referral-credit note when a `?ref=` is present. No coupon math here
 * (the design's coupon UI is part of the Stripe-backed step, which is stubbed).
 */
export function OrderSummary({ plan, refCode }: OrderSummaryProps) {
  const price = `$${plan.monthly.toFixed(2)}`;

  return (
    <div className="co-summary">
      <SurfaceCard padded>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Order summary</h2>

        <div className="co-sum-row" style={{ marginBottom: 10 }}>
          <span className="muted">FX Academy {plan.name}</span>
          <span>{price}</span>
        </div>
        <div className="co-sum-row" style={{ marginBottom: 8, fontSize: 14 }}>
          <span className="muted">Billing</span>
          <span>Monthly</span>
        </div>

        <hr className="divider" style={{ margin: '14px 0' }} />

        <div className="co-sum-row co-sum-total">
          <span>Due today</span>
          <span>{price}</span>
        </div>

        <p className="muted co-sum-fine">
          Cancel anytime. By subscribing you agree to our Terms. FX Academy provides educational
          content only, not financial advice.
        </p>
      </SurfaceCard>

      {refCode && (
        <div className="co-ref-note">
          <Badge tone="forest">Referred by {refCode} — credit applied</Badge>
        </div>
      )}
    </div>
  );
}
