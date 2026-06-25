'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/client';
import { saveTradingProfile } from '@/lib/onboarding/save-profile';
import { parseTradingProfile, type TradingProfile } from '@/lib/onboarding/profile-fields';
import { SELECTABLE_PLANS, plan as planById, type Plan } from '@/lib/checkout/plan';
import { withRef } from '@/lib/href';
import { Stepper } from '../_components/profile/Stepper';
import { ProfileStep } from '../_components/profile/ProfileStep';
import { PlanPicker } from './_components/PlanPicker';
import { OrderSummary } from './_components/OrderSummary';

const STEP_LABELS = ['Account', 'Plan', 'Payment', 'Profile'] as const;

type ProfileDraft = Partial<Record<keyof TradingProfile, string>>;

interface CheckoutFlowProps {
  /** True when a Supabase session exists (decided server-side). */
  authenticated: boolean;
  /** Plan id resolved from `?plan=` (defaults to Pro). */
  initialPlanId: Plan['id'];
  /** Sanitized referral code, forwarded through the flow. */
  refCode: string | null;
}

/**
 * 4-step checkout (PROJECT.md §9 module 2): account → plan → payment → trading
 * profile. The PAYMENT STEP IS STUBBED — Stripe is not wired yet, so we show a
 * "coming soon" notice and allow proceeding without payment. Selected plan and
 * `?ref=` are preserved throughout.
 *
 * Auth lives on /signup + /login; the account step routes there (carrying plan,
 * ref, and a redirect back into checkout) when the visitor is not signed in.
 */
export function CheckoutFlow({ authenticated, initialPlanId, refCode }: CheckoutFlowProps) {
  const router = useRouter();

  // Skip the account step when already authenticated.
  const [step, setStep] = useState<number>(authenticated ? 1 : 0);
  const [planId, setPlanId] = useState<Plan['id']>(initialPlanId);
  const [profile, setProfile] = useState<ProfileDraft>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const plan = useMemo(() => planById(planId), [planId]);

  const progress = STEP_LABELS.map((label, i) => ({ label, done: i < step }));

  function goSignup() {
    const back = withRef(`/checkout?plan=${planId}&step=plan`, refCode);
    const href = withRef(`/signup?plan=${planId}&redirect=${encodeURIComponent(back)}`, refCode);
    router.push(href);
  }

  function next() {
    setError(null);
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, authenticated ? 1 : 0));
  }

  async function finish() {
    const parsed = parseTradingProfile(profile);
    if (!parsed) {
      setError('Please answer all five questions to finish.');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const result = await saveTradingProfile(supabase, parsed);
      if (!result.ok) {
        setError(result.error ?? 'We could not save your profile. Please try again.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="co-wrap">
      <div>
        <Stepper steps={progress} activeIndex={step} />

        {step === 0 && (
          <section aria-labelledby="co-step-account">
            <h1 id="co-step-account" className="co-panel-title">
              Create your account
            </h1>
            <p className="muted" style={{ margin: '6px 0 22px' }}>
              You&rsquo;ll choose a plan and set up your trading profile next.
            </p>
            <div className="stack gap2 co-fields">
              <Button variant="lime" size="lg" onClick={goSignup}>
                Continue with email
              </Button>
              <p className="muted" style={{ fontSize: 14 }}>
                Already have an account?{' '}
                <a
                  href={withRef(
                    `/login?redirect=${encodeURIComponent(withRef(`/checkout?plan=${planId}&step=plan`, refCode))}`,
                    refCode,
                  )}
                  className="auth-link-strong"
                >
                  Log in
                </a>
              </p>
            </div>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="co-step-plan">
            <h1 id="co-step-plan" className="co-panel-title">
              Choose your plan
            </h1>
            <p className="muted" style={{ margin: '6px 0 22px' }}>
              Pro is recommended — switch anytime.
            </p>
            <PlanPicker plans={SELECTABLE_PLANS} selectedId={planId} onSelect={setPlanId} />
            <div className="co-actions">
              <span />
              <Button variant="lime" size="lg" onClick={next}>
                Continue to payment
              </Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="co-step-payment">
            <h1 id="co-step-payment" className="co-panel-title">
              Payment
            </h1>
            <p className="muted" style={{ margin: '6px 0 22px' }}>
              Secure card payment is on the way.
            </p>
            <div className="co-stub co-fields" role="note">
              <div className="co-stub-icon" aria-hidden="true">
                🔒
              </div>
              <p className="co-stub-title">Secure checkout coming soon</p>
              <p className="co-stub-text muted">
                Stripe integration is pending. For now you can continue to set up your trading
                profile — no card required. Your selected plan ({plan.name}) is saved.
              </p>
            </div>
            <div className="co-actions">
              <Button variant="ghost" onClick={back}>
                Back
              </Button>
              <Button variant="lime" size="lg" onClick={next}>
                Continue without payment
              </Button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="co-step-profile">
            <h1 id="co-step-profile" className="co-panel-title">
              Your trading profile
            </h1>
            <p className="muted" style={{ margin: '6px 0 22px' }}>
              We&rsquo;ll use this to personalize your dashboard and pre-fill your risk calculator.
            </p>

            <ProfileStep
              value={profile}
              onChange={(key, value) => {
                setProfile((prev) => ({ ...prev, [key]: value }));
                setError(null);
              }}
            />

            {error && (
              <p className="auth-field-error" role="alert" style={{ marginTop: 12 }}>
                {error}
              </p>
            )}

            <Disclaimer kind="risk" variant="note" style={{ marginTop: 16 }} />

            <div className="co-actions">
              <Button variant="ghost" onClick={back} disabled={submitting}>
                Back
              </Button>
              <Button variant="lime" size="lg" onClick={finish} disabled={submitting}>
                {submitting ? 'Saving…' : 'Finish & enter FX Academy'}
              </Button>
            </div>
          </section>
        )}
      </div>

      <OrderSummary plan={plan} refCode={refCode} />
    </div>
  );
}
