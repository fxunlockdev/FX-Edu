'use client';

import { Button } from '@fxunlock/ui';
import { isGoogleOAuthEnabled } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/client';

interface GoogleButtonProps {
  /** Label, e.g. "Continue with Google". */
  label: string;
}

/**
 * Google OAuth button. Creds are added later (PROJECT.md §9 module 2 + F2), so
 * the button is PRESENT BUT DISABLED with a "coming soon" hint until
 * `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` is 'true'. When enabled it kicks off the
 * Supabase OAuth redirect to `/auth/callback`.
 *
 * Disabled state is announced to assistive tech via `aria-disabled` +
 * `aria-describedby` pointing at the hint, and the hint has `role="note"`.
 */
export function GoogleButton({ label }: GoogleButtonProps) {
  const enabled = isGoogleOAuthEnabled();

  async function onClick() {
    if (!enabled) return;
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  }

  return (
    <div style={{ width: '100%' }}>
      <Button
        type="button"
        variant="ghost"
        block
        onClick={onClick}
        disabled={!enabled}
        aria-disabled={!enabled || undefined}
        aria-describedby={!enabled ? 'google-coming-soon' : undefined}
      >
        {label}
      </Button>
      {!enabled && (
        <p id="google-coming-soon" className="auth-oauth-hint" role="note">
          Google sign-in is coming soon.
        </p>
      )}
    </div>
  );
}
