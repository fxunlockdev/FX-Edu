/**
 * Idempotency store for webhook/payment processing (§6.6, §7 "idempotency keys
 * for webhooks and payment-related operations").
 *
 * `seen` returns true if the key was already processed; `remember` marks it as
 * processed. A replayed Stripe event therefore becomes a no-op. The real store
 * is durable (Postgres `idempotency_keys` table per §10), keyed by event id.
 */
export interface IdempotencyStore {
  seen(key: string): Promise<boolean>;
  remember(key: string): Promise<void>;
}

export const IDEMPOTENCY_STORE = 'FX_IDEMPOTENCY_STORE';
