import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Logo, SurfaceCard } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { OnboardingForm } from './OnboardingForm';
import '../_components/profile/profile.css';
import './onboarding.css';

export const metadata: Metadata = {
  title: 'Set up your profile',
  description: 'Personalize your FX Academy experience.',
  robots: { index: false, follow: false },
};

/**
 * Onboarding page (RSC). Server-gated: a visitor without a session is sent to
 * login (never trust the client for the auth decision — PROJECT.md §6.1). New
 * users land here after signup; the interactive multi-step form is a client
 * leaf that writes the trading profile to the RLS-scoped `profiles` table.
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/onboarding');
  }

  return (
    <div className="onb-page">
      <header className="onb-header">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={28} />
        </a>
        <h1 className="onb-title h-md">Your trading profile</h1>
        <p className="muted">
          A few quick questions so we can personalize your dashboard and pre-fill your risk
          calculator. You can change all of this later in Settings.
        </p>
      </header>

      <SurfaceCard className="onb-card" padded>
        <OnboardingForm doneHref="/dashboard" userEmail={user.email ?? 'trader'} />
      </SurfaceCard>
    </div>
  );
}
