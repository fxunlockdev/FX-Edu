'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/client';
import { saveProfileSettings } from '../save-settings';
import {
  COUNTRY_OPTIONS,
  MAX_BIO,
  MAX_DISPLAY_NAME,
  MAX_FULL_NAME,
} from '../settings-fields';

export interface ProfileValues {
  readonly fullName: string;
  readonly displayName: string;
  readonly email: string;
  readonly country: string;
  readonly bio: string;
}

interface FormState {
  fullName: string;
  displayName: string;
  country: string;
  bio: string;
}

/** Two-letter initials for the avatar fallback. */
function initials(name: string, email: string): string {
  const source = name.trim() || email.trim();
  if (!source) return 'FX';
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const a = parts[0]?.[0] ?? '';
  const b = parts[1]?.[0] ?? '';
  return (a + b || a || 'FX').toUpperCase();
}

/**
 * Profile section (PROJECT.md §8.16). Pure client leaf: the RSC shell stays
 * server-rendered and auth-gated; this owns the form state and the RLS-scoped
 * write via `saveProfileSettings`.
 *
 * Email is shown read-only with a pointer to Security — changing it is a
 * step-up + re-verification flow (handled in `SecuritySection`), not a plain
 * profile field. The photo upload is a stub: Storage wiring (signed upload +
 * scan-before-serve, §F5) lands later, so selecting a file only previews the
 * filename.
 */
export function ProfileSection({ initial }: { initial: ProfileValues }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: initial.fullName,
    displayName: initial.displayName,
    country: initial.country,
    bio: initial.bio,
  });
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setSaved(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const result = await saveProfileSettings(supabase, form);
      if (!result.ok) {
        setError(result.error ?? 'We could not save your profile. Please try again.');
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="set-panel" aria-labelledby="set-profile-h" onSubmit={submit} aria-busy={submitting}>
      <h2 className="set-ph" id="set-profile-h">
        Profile
      </h2>
      <p className="set-psub">This is how you appear in the community and on certificates.</p>

      <div className="set-avatar-row">
        <div className="set-avatar" aria-hidden="true">
          {initials(form.fullName, initial.email)}
        </div>
        <div>
          {/* Upload is stubbed for v1 — Storage signing + malware scan land in F5.
              Selecting a file records its name only; nothing is uploaded. */}
          <label className="btn btn-ghost btn-sm" htmlFor="set-photo">
            Change photo
          </label>
          <input
            id="set-photo"
            type="file"
            accept="image/png,image/jpeg"
            style={{ display: 'none' }}
            onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
          />
          <p className="set-hint">
            {photoName ? (
              <>
                Selected <strong>{photoName}</strong> — upload coming soon
              </>
            ) : (
              'JPG or PNG, max 2MB'
            )}
          </p>
        </div>
      </div>

      <div className="set-frow">
        <div className="field">
          <label htmlFor="set-fullname">Full name</label>
          <input
            id="set-fullname"
            className="input"
            value={form.fullName}
            maxLength={MAX_FULL_NAME}
            autoComplete="name"
            onChange={(e) => set('fullName', e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="set-displayname">Display name</label>
          <input
            id="set-displayname"
            className="input"
            value={form.displayName}
            maxLength={MAX_DISPLAY_NAME}
            autoComplete="nickname"
            onChange={(e) => set('displayName', e.target.value)}
          />
        </div>
      </div>

      <div className="set-frow">
        <div className="field">
          <label htmlFor="set-email">Email</label>
          <input
            id="set-email"
            className="input"
            type="email"
            value={initial.email}
            readOnly
            aria-describedby="set-email-note"
          />
          <p className="set-hint" id="set-email-note">
            Change your email under <strong>Security</strong> — it needs re-verification.
          </p>
        </div>
        <div className="field">
          <label htmlFor="set-country">Country</label>
          <select
            id="set-country"
            className="input"
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
          >
            <option value="">Prefer not to say</option>
            {COUNTRY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field set-field-mb">
        <label htmlFor="set-bio">Bio</label>
        <textarea
          id="set-bio"
          className="input"
          rows={3}
          value={form.bio}
          maxLength={MAX_BIO}
          onChange={(e) => set('bio', e.target.value)}
          placeholder="Aspiring swing trader focused on market structure and risk discipline."
        />
        <p className="set-hint">
          {form.bio.length}/{MAX_BIO}
        </p>
      </div>

      {error && (
        <p className="auth-field-error set-status" role="alert">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="set-saved" role="status">
          Profile saved.
        </p>
      )}

      <Button type="submit" variant="forest" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
