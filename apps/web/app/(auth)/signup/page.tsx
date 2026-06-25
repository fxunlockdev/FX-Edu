import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { safeRedirectPath } from '@/lib/auth/redirect';
import { resolvePlan } from '@/lib/checkout/plan';
import { sanitizeRef } from '@/lib/referral';
import { withRef } from '@/lib/href';
import { AuthBrandPanel } from '../_components/AuthBrandPanel';
import { GoogleButton } from '../_components/GoogleButton';
import { SignupForm } from './SignupForm';
import '../auth.css';

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Create your FX Academy account and start your structured learning path.',
  robots: { index: false, follow: false },
};

interface SignupPageProps {
  // Next.js 15: searchParams is async.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Signup page shell (RSC). After signup the user goes to onboarding, carrying
 * the selected plan + sanitized referral so attribution + plan intent survive
 * (PROJECT.md §9 module 2). Already-authenticated visitors are bounced onward.
 */
export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const plan = resolvePlan(params.plan);
  const refCode = sanitizeRef(params.ref);

  // After signup, continue into onboarding (carrying plan + ref). An explicit
  // `?redirect=` (validated) wins so checkout's account step can route back.
  const onboardingHref = withRef(`/onboarding?plan=${plan.id}`, refCode);
  const redirectTo = safeRedirectPath(params.redirect, onboardingHref);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(redirectTo);
  }

  return (
    <div className="auth">
      <AuthBrandPanel variant="signup" />

      <main className="auth-form" id="main">
        <div className="auth-form-inner">
          <h1 className="h-md">Create your account</h1>
          <p className="muted" style={{ margin: '6px 0 24px' }}>
            Start your structured learning path. You can choose a plan next.
          </p>

          <div className="auth-oauth" style={{ marginBottom: 18 }}>
            <GoogleButton label="Sign up with Google" />
          </div>

          <div className="auth-divider">
            <hr />
            <span>or</span>
            <hr />
          </div>

          <SignupForm redirectTo={redirectTo} />

          <Disclaimer kind="risk" className="auth-fineprint" style={{ marginTop: 18, color: 'var(--on-surface-var)' }} />

          <p className="auth-meta">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </main>
    </div>
  );
}
