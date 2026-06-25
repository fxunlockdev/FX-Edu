import type { Metadata } from 'next';
import { Logo, Badge } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { resolvePlan } from '@/lib/checkout/plan';
import { sanitizeRef } from '@/lib/referral';
import { CheckoutFlow } from './CheckoutFlow';
import '../_components/profile/profile.css';
import './checkout.css';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Set up your FX Academy membership.',
  robots: { index: false, follow: false },
};

interface CheckoutPageProps {
  // Next.js 15: searchParams is async.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Checkout page shell (RSC). Resolves the selected plan + referral server-side
 * and reads the session so the flow can skip the account step when the visitor
 * is already signed in. The interactive 4-step flow is a client leaf; the
 * payment step is stubbed (no Stripe yet — see CheckoutFlow).
 */
export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const plan = resolvePlan(params.plan);
  const refCode = sanitizeRef(params.ref);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <header className="co-top">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={26} />
        </a>
        <div className="co-top-actions">
          <Badge tone="pos" dot>
            Secure checkout
          </Badge>
          <a href="/" className="co-exit">
            Exit
          </a>
        </div>
      </header>

      <main id="main">
        <CheckoutFlow authenticated={!!user} initialPlanId={plan.id} refCode={refCode} />
      </main>
    </>
  );
}
