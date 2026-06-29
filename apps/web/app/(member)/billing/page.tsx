import type { Metadata } from 'next';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '../_components/SignOutButton';
import {
  deriveBilling,
  sampleInvoices,
  SUBSCRIPTION_SELECT_COLUMNS,
  CurrentPlanCard,
  BillingHistory,
  PaymentMethod,
  PlanIncludes,
  CancelPanel,
  FailedPaymentBanner,
  type SubscriptionRow,
} from './_components';
import './billing.css';

export const metadata: Metadata = {
  title: 'Billing',
  robots: { index: false, follow: false },
};

/**
 * Billing — self-service (M16 / PROJECT.md §16). RSC: the `(member)` layout
 * already enforced the server-side auth gate, so this route is reachable only by
 * a signed-in user.
 *
 * Subscription read is DEFENSIVE and RLS-scoped: a user only ever sees their own
 * row. The `subscriptions` table is not deployed yet, so the query DEGRADES
 * GRACEFULLY — any error (table missing) collapses to `null`, which
 * `deriveBilling` maps to the "No active subscription / Free" state. The page
 * never errors and never implies a paid plan the member doesn't hold.
 *
 * Every billing MUTATION is STUBBED here (no Stripe SDK, no secrets in the web
 * app). The framing the UI repeats — and that the real integration must honor:
 *   • changes reflect only after a Stripe webhook confirms them (§16 🔒);
 *   • no card data is ever stored locally — Stripe owns it (§16 🔒);
 *   • canceling keeps access until the end of the current period (§16 ✨).
 * Live billing changes additionally require step-up auth, which lands with the
 * Stripe integration. // TODO: wire portal/cancel via the API once Stripe is live.
 */
export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── RLS-scoped, defensive read (never throws on an undeployed table) ──────
  let subscription: SubscriptionRow | null = null;
  if (user) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(SUBSCRIPTION_SELECT_COLUMNS)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!error) subscription = (data as SubscriptionRow | null) ?? null;
  }

  const view = deriveBilling(subscription);
  const invoices = sampleInvoices(view);
  const planBadgePro = view.hasSubscription && view.plan.id !== 'basic';

  return (
    <div className="bill">
      <header className="bill-top">
        <a href="/dashboard" aria-label="FX Academy dashboard">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={planBadgePro ? 'lime-dark' : 'outline'}>
            {view.hasSubscription ? view.plan.name : 'Free'}
          </Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="bill-main" id="main">
        <h1 className="h-md bill-h1">Billing</h1>

        {view.paymentFailed && <FailedPaymentBanner renewalLabel={view.renewalLabel} />}

        <div className="bill-grid">
          <div className="bill-col-main">
            <CurrentPlanCard view={view} />
            <BillingHistory invoices={invoices} isSample={view.hasSubscription} />
          </div>

          <aside className="bill-col-side" aria-label="Plan and payment details">
            <PaymentMethod method={view.paymentMethod} />
            <PlanIncludes plan={view.plan} />
            <CancelPanel view={view} />
          </aside>
        </div>

        <p className="bill-foot-note muted">
          Changes to your plan are processed by Stripe and reflected here only after the payment is
          confirmed. We never store your card details.
        </p>

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 24 }} />
      </main>
    </div>
  );
}
