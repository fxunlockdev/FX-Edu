'use client';

import { useState } from 'react';
import { Button } from '@fxunlock/ui';

/**
 * "Manage plan via Stripe Customer Portal" control — STUBBED (M16 / PROJECT.md
 * §16). The real flow mints a portal session server-side and redirects:
 *
 *   // TODO: POST /billing/portal-session via the API (needs step-up + live Stripe)
 *
 * Stripe is not wired yet (no SDK, no secrets in the web app), so instead of
 * navigating we surface an inline, accessible notice. Billing changes are always
 * webhook-gated server-side; this button can never mutate state on its own.
 */
export function ManagePlanButton({ glass = false }: { glass?: boolean }) {
  const [shown, setShown] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={glass ? 'glass' : 'ghost'}
        size="sm"
        aria-expanded={shown}
        aria-controls="billing-portal-note"
        onClick={() => setShown(true)}
      >
        Manage plan
      </Button>
      {shown && (
        <p id="billing-portal-note" role="status" className="bill-stub-note">
          Billing portal coming soon — Stripe integration pending. Plan changes,
          invoices and your card are managed securely in Stripe; nothing is stored here.
        </p>
      )}
    </>
  );
}
