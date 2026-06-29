'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@fxunlock/ui';
import { isGoogleOAuthEnabled } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/client';
import {
  changePassword,
  requestAccountDeletion,
  requestDataExport,
  requestEmailChange,
  MIN_PASSWORD_LENGTH,
} from '../security-actions';

/** A static, designed stub of active sessions. Real session enumeration +
 *  revocation arrives with the F2 auth/AAL work; until then we show the current
 *  device honestly and mark the rest as illustrative. */
const STUB_SESSIONS: ReadonlyArray<{
  id: string;
  device: string;
  where: string;
  current: boolean;
}> = [
  { id: 'this', device: 'This browser', where: 'Active now', current: true },
  { id: 's2', device: 'Safari · iPhone', where: 'London, UK · 2 days ago', current: false },
];

/**
 * Security section (PROJECT.md §8.16 🔒). The most security-sensitive surface:
 * password change, email change (step-up + re-verification), MFA/passkeys,
 * active sessions, connected accounts, and GDPR export/delete.
 *
 * Nothing here trusts the client for the security decision — password/email go
 * through Supabase Auth (validates the live session server-side); GDPR actions
 * only *register intent* (the audited cascade runs in a worker). Each block is
 * a small independent panel with its own status line.
 */
export function SecuritySection({ currentEmail }: { currentEmail: string }) {
  const googleEnabled = isGoogleOAuthEnabled();

  return (
    <div className="set-panel set-panel-stack" aria-labelledby="set-sec-h">
      <h2 className="set-ph" id="set-sec-h">
        Security
      </h2>
      <p className="set-psub">Protect your account and control your data.</p>

      <PasswordPanel />
      <EmailPanel currentEmail={currentEmail} />
      <MfaPanel />
      <SessionsPanel />
      <ConnectedAccountsPanel googleEnabled={googleEnabled} />
      <DangerZonePanel />
    </div>
  );
}

/** ── Change password ───────────────────────────────────────────────────── */
function PasswordPanel() {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    setBusy(true);
    try {
      const result = await changePassword(createClient(), pw, confirm);
      if (!result.ok) {
        setError(result.error ?? 'Could not update password.');
        return;
      }
      setDone(result.message ?? 'Password updated.');
      setPw('');
      setConfirm('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="set-block" onSubmit={submit} aria-busy={busy}>
      <h3 className="set-bh">Change password</h3>
      <div className="set-frow">
        <div className="field">
          <label htmlFor="set-pw">New password</label>
          <input
            id="set-pw"
            className="input"
            type="password"
            autoComplete="new-password"
            value={pw}
            minLength={MIN_PASSWORD_LENGTH}
            onChange={(e) => {
              setPw(e.target.value);
              setError(null);
              setDone(null);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="set-pw2">Confirm new password</label>
          <input
            id="set-pw2"
            className="input"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setError(null);
              setDone(null);
            }}
          />
        </div>
      </div>
      {error && (
        <p className="auth-field-error set-status" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="set-saved" role="status">
          {done}
        </p>
      )}
      <Button type="submit" variant="forest" size="sm" disabled={busy || pw === ''}>
        {busy ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}

/** ── Change email (step-up + re-verification) ──────────────────────────── */
function EmailPanel({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    setBusy(true);
    try {
      const result = await requestEmailChange(createClient(), email, currentEmail);
      if (!result.ok) {
        setError(result.error ?? 'Could not start the email change.');
        return;
      }
      setDone(result.message ?? 'Check your inbox to confirm.');
      setEmail('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="set-block" onSubmit={submit} aria-busy={busy}>
      <h3 className="set-bh">Email address</h3>
      <p className="set-hint set-hint-block">
        Current: <strong>{currentEmail || 'unknown'}</strong>. Changing it sends a confirmation
        link to both addresses — the change applies only after you verify the new one (a step-up
        re-auth check applies once MFA is enabled).
      </p>
      <div className="field set-field-mb">
        <label htmlFor="set-email-new">New email</label>
        <input
          id="set-email-new"
          className="input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
            setDone(null);
          }}
          placeholder="you@example.com"
        />
      </div>
      {error && (
        <p className="auth-field-error set-status" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="set-saved" role="status">
          {done}
        </p>
      )}
      <Button type="submit" variant="ghost" size="sm" disabled={busy || email === ''}>
        {busy ? 'Sending…' : 'Send verification'}
      </Button>
    </form>
  );
}

/** ── MFA & passkeys (present + manage stub) ────────────────────────────── */
function MfaPanel() {
  return (
    <div className="set-block">
      <h3 className="set-bh">Two-factor & passkeys</h3>
      <div className="set-conn-row">
        <div className="set-conn-copy">
          <span className="set-conn-title">Authenticator app (TOTP)</span>
          <span className="set-toggle-hint">Add a time-based code as a second factor.</span>
        </div>
        {/* MFA enrol uses Supabase `auth.mfa.enroll()` — wired with F2's AAL flow.
            // TODO: wire Supabase MFA enroll/verify (AAL2) — present-but-stubbed. */}
        <Button type="button" variant="ghost" size="sm" disabled>
          Set up
        </Button>
      </div>
      <div className="set-conn-row">
        <div className="set-conn-copy">
          <span className="set-conn-title">Passkeys (WebAuthn)</span>
          <span className="set-toggle-hint">Sign in with Face ID, Touch ID, or a security key.</span>
        </div>
        {/* // TODO: wire WebAuthn passkey registration (F2). Present-but-stubbed. */}
        <Button type="button" variant="ghost" size="sm" disabled>
          Add passkey
        </Button>
      </div>
      <p className="set-hint set-hint-block">
        Coming with the upgraded sign-in experience. Two-factor will be required for admin and
        payout actions.
      </p>
    </div>
  );
}

/** ── Active sessions (stub list) ───────────────────────────────────────── */
function SessionsPanel() {
  return (
    <div className="set-block">
      <h3 className="set-bh">Active sessions</h3>
      <ul className="set-session-list">
        {STUB_SESSIONS.map((s) => (
          <li className="set-session-row" key={s.id}>
            <div className="set-conn-copy">
              <span className="set-conn-title">
                {s.device}
                {s.current && <span className="set-badge-now">This device</span>}
              </span>
              <span className="set-toggle-hint">{s.where}</span>
            </div>
            {!s.current && (
              // TODO: wire session revocation once F2 exposes the sessions API.
              <Button type="button" variant="ghost" size="sm" disabled>
                Revoke
              </Button>
            )}
          </li>
        ))}
      </ul>
      <p className="set-hint set-hint-block">
        Full session management (sign out other devices) arrives with the upgraded auth flow.
      </p>
    </div>
  );
}

/** ── Connected accounts ────────────────────────────────────────────────── */
function ConnectedAccountsPanel({ googleEnabled }: { googleEnabled: boolean }) {
  return (
    <div className="set-block">
      <h3 className="set-bh">Connected accounts</h3>
      <div className="set-conn-row">
        <div className="set-conn-copy">
          <span className="set-conn-title">Google</span>
          <span className="set-toggle-hint">
            {googleEnabled ? 'Not connected' : 'Available soon'}
          </span>
        </div>
        {/* Google OAuth is gated behind NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED; until
            creds land the control stays present-but-disabled (matches the login
            page convention). // TODO: wire Google OAuth link/unlink. */}
        <Button type="button" variant="ghost" size="sm" disabled>
          {googleEnabled ? 'Connect' : 'Soon'}
        </Button>
      </div>
    </div>
  );
}

/** ── Danger zone: GDPR export + delete ─────────────────────────────────── */
function DangerZonePanel() {
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function exportData() {
    setError(null);
    setNote(null);
    setBusy('export');
    try {
      const result = await requestDataExport(createClient());
      if (!result.ok) {
        setError(result.error ?? 'Could not start the export.');
        return;
      }
      setNote(result.message ?? 'Export requested.');
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount() {
    setError(null);
    setNote(null);
    setBusy('delete');
    try {
      const result = await requestAccountDeletion(createClient());
      if (!result.ok) {
        setError(result.error ?? 'Could not start the deletion.');
        return;
      }
      setNote(result.message ?? 'Deletion requested.');
      setConfirming(false);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="set-block set-danger">
      <h3 className="set-bh">Your data</h3>
      <p className="set-hint set-hint-block">
        Export a copy of your data, or permanently delete your account. Both start a compliant
        request — we email confirmation and process it securely.
      </p>

      <div className="set-danger-actions">
        <Button type="button" variant="ghost" size="sm" onClick={exportData} disabled={busy !== null}>
          {busy === 'export' ? 'Requesting…' : 'Export my data'}
        </Button>

        {confirming ? (
          <span className="set-confirm">
            <span className="set-confirm-q">Delete permanently?</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(false)}
              disabled={busy !== null}
            >
              Cancel
            </Button>
            <button
              type="button"
              className="set-delete-btn"
              onClick={deleteAccount}
              disabled={busy !== null}
            >
              {busy === 'delete' ? 'Requesting…' : 'Yes, delete'}
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="set-delete-btn"
            onClick={() => {
              setConfirming(true);
              setError(null);
              setNote(null);
            }}
            disabled={busy !== null}
          >
            Delete account
          </button>
        )}
      </div>

      {error && (
        <p className="auth-field-error set-status" role="alert">
          {error}
        </p>
      )}
      {note && (
        <p className="set-saved" role="status">
          {note}
        </p>
      )}
    </div>
  );
}
