import type { Metadata } from 'next';
import { Logo, SurfaceCard, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { profileLabel } from '@/lib/onboarding/labels';
import { SignOutButton } from '../_components/SignOutButton';
import './dashboard.css';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

interface ProfileRow {
  experience_level: string | null;
  main_goal: string | null;
  account_size: string | null;
  risk_comfort: string | null;
  acquisition_source: string | null;
  onboarded_at: string | null;
}

/**
 * Minimal authenticated landing (PROJECT.md §9 module 18 is the full dashboard;
 * this is the M2 placeholder that proves the protected-route gate). The
 * `(member)` layout already guaranteed a session, so we can greet the user by
 * email and surface their saved trading profile (read through RLS — a user can
 * only ever see their own row).
 *
 * The profile read is defensive: if the `profiles` table is not provisioned yet
 * it degrades to an "complete onboarding" prompt instead of erroring.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The layout guarantees a user; this satisfies the type and is a cheap guard.
  const email = user?.email ?? 'trader';

  let profile: ProfileRow | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('experience_level, main_goal, account_size, risk_comfort, acquisition_source, onboarded_at')
      .eq('id', user.id)
      .maybeSingle();
    profile = (data as ProfileRow | null) ?? null;
  }

  const onboarded = !!profile?.onboarded_at;

  return (
    <div className="dash">
      <header className="dash-top">
        <a href="/" aria-label="FX Academy home">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone="lime-dark">Member</Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="dash-main" id="main">
        <p className="dash-stat-label">Welcome back</p>
        <h1 className="dash-greeting h-md">{email}</h1>
        <p className="muted">
          You&rsquo;re signed in. This is your member area — the full dashboard lands as later
          modules ship.
        </p>

        {onboarded ? (
          <SurfaceCard padded style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Your trading profile</h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
              Used to personalize your dashboard and pre-fill your risk calculator.
            </p>
            <div className="dash-grid">
              <ProfileStat label="Experience" value={profileLabel.experience(profile?.experience_level)} />
              <ProfileStat label="Main goal" value={profileLabel.goal(profile?.main_goal)} />
              <ProfileStat label="Account size" value={profileLabel.accountSize(profile?.account_size)} />
              <ProfileStat label="Risk comfort" value={profileLabel.riskComfort(profile?.risk_comfort)} />
              <ProfileStat label="Heard via" value={profileLabel.source(profile?.acquisition_source)} />
            </div>
          </SurfaceCard>
        ) : (
          <SurfaceCard padded hover style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Finish setting up</h2>
            <p className="muted" style={{ marginBottom: 14 }}>
              Complete your trading profile so we can personalize your experience.
            </p>
            <a href="/onboarding" className="btn btn-lime btn-sm">
              Complete onboarding
            </a>
          </SurfaceCard>
        )}

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28 }} />
      </main>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value">{value ?? '—'}</div>
    </div>
  );
}
