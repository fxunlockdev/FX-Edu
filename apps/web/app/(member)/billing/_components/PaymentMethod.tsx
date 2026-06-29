import { ManagePlanButton } from './ManagePlanButton';
import type { PaymentMethodView } from './billing-data';

interface PaymentMethodProps {
  method: PaymentMethodView | null;
}

/**
 * Payment-method summary (RSC) — STUBBED. We only ever render the last 4 + brand
 * that Stripe reports back; the full card is NEVER stored locally (PROJECT.md §16
 * 🔒 "no card data stored"). "Update card" routes through the Stripe Customer
 * Portal stub, which is where card details actually live.
 */
export function PaymentMethod({ method }: PaymentMethodProps) {
  return (
    <section className="bill-panel" aria-labelledby="bill-pm-heading">
      <h3 id="bill-pm-heading" className="bill-ph">
        Payment method
      </h3>

      {method ? (
        <div className="bill-card-row">
          <span className="bill-card-brand" aria-hidden="true">
            {method.brand}
          </span>
          <div>
            <div className="bill-card-num">•••• {method.last4}</div>
            <div className="muted bill-card-exp">{method.expLabel}</div>
          </div>
        </div>
      ) : (
        <p className="bill-empty muted">
          No card on file. Your payment method is added and managed securely in Stripe — we never
          store card data here.
        </p>
      )}

      <p className="bill-pm-note muted">Managed by Stripe; no card data is stored locally.</p>

      <div className="bill-pm-action">
        <ManagePlanButton />
      </div>
    </section>
  );
}
