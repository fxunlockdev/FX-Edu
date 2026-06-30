import type { Metadata } from 'next';
import { Logo, Badge, Disclaimer } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/server';
import { getViewerPlan, isPro } from '@/lib/entitlements/plan';
import { SignOutButton } from '../_components/SignOutButton';
import { SettingsView } from './_components/SettingsView';
import { prefsFromRow, type NotificationPrefs } from './settings-fields';
import './settings.css';

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
};

interface ProfileRow {
  full_name: string | null;
  display_name: string | null;
  country: string | null;
  bio: string | null;
  risk_profile: string | null;
  default_session: string | null;
  risk_comfort: string | null;
}

/**
 * Settings (RSC) — PROJECT.md §9 module 17 / §8.16. The `(member)` layout has
 * already enforced the server-side auth gate, so this route is reachable only by
 * a signed-in user.
 *
 * We read the caller's profile + notification preferences through the
 * RLS-scoped server client (a user only ever sees their own rows) and hand the
 * initial values to the interactive `SettingsView` leaf. Both reads degrade
 * gracefully: if a table is not provisioned yet the section falls back to
 * sensible defaults instead of erroring.
 *
 * Email is sourced from the Auth session (not `profiles`) because it lives in
 * Supabase Auth and changing it is a step-up + re-verification flow.
 */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? '';
  // Badge-only hint here; nothing on this page is plan-gated (§6.1). The
  // server-side gate is authoritative; the UI lock is a hint.
  const pro = isPro(await getViewerPlan());

  let profile: ProfileRow | null = null;
  let prefs: NotificationPrefs = prefsFromRow(null);

  if (user) {
    const [{ data: profileData }, { data: prefsData }] = await Promise.all([
      supabase
        .from('profiles')
        .select(
          'full_name, display_name, country, bio, risk_profile, default_session, risk_comfort',
        )
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    profile = (profileData as ProfileRow | null) ?? null;
    prefs = prefsFromRow(prefsData as Record<string, unknown> | null);
  }

  // Risk profile falls back to the onboarding risk-comfort answer when the
  // dedicated column has not been set yet, so the control is pre-filled.
  const riskProfile = profile?.risk_profile ?? profile?.risk_comfort ?? 'balanced';

  return (
    <div className="set">
      <header className="set-top">
        <a href="/dashboard" aria-label="FX Academy dashboard">
          <Logo variant="dark" size={26} />
        </a>
        <div className="row gap2" style={{ alignItems: 'center' }}>
          <Badge tone={pro ? 'lime-dark' : 'outline'}>{pro ? 'Pro' : 'Basic'}</Badge>
          <SignOutButton />
        </div>
      </header>

      <main className="set-main" id="main">
        <h1 className="h-md" style={{ margin: '0 0 20px' }}>
          Settings
        </h1>

        <SettingsView
          initialProfile={{
            fullName: profile?.full_name ?? '',
            displayName: profile?.display_name ?? '',
            email,
            country: profile?.country ?? '',
            bio: profile?.bio ?? '',
          }}
          initialPrefs={prefs}
          initialLearning={{
            riskProfile,
            defaultSession: profile?.default_session ?? 'london',
          }}
        />

        <Disclaimer kind="risk" variant="note" style={{ marginTop: 28, maxWidth: 760 }} />
      </main>
    </div>
  );
}
