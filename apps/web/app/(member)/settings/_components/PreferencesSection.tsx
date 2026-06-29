'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/client';
import { saveLearningPrefs } from '../save-settings';
import { DEFAULT_SESSION_OPTIONS, RISK_PROFILE_OPTIONS } from '../settings-fields';

export interface LearningValues {
  readonly riskProfile: string;
  readonly defaultSession: string;
}

/**
 * Learning preferences section (PROJECT.md §8.16). Risk profile drives example
 * sizing across the app (its values mirror the onboarding risk-comfort keys),
 * and default session pre-selects the journal session filter. Persists to
 * `profiles` via the RLS-scoped `saveLearningPrefs`.
 */
export function PreferencesSection({ initial }: { initial: LearningValues }) {
  const router = useRouter();
  const [form, setForm] = useState<LearningValues>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof LearningValues>(key: K, value: LearningValues[K]) {
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
      const result = await saveLearningPrefs(supabase, form);
      if (!result.ok) {
        setError(result.error ?? 'We could not save your preferences. Please try again.');
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="set-panel" aria-labelledby="set-pref-h" onSubmit={submit} aria-busy={submitting}>
      <h2 className="set-ph" id="set-pref-h">
        Learning preferences
      </h2>
      <p className="set-psub">Tune the experience around how you study.</p>

      <div className="set-frow">
        <div className="field">
          <label htmlFor="set-risk">Risk profile (for examples)</label>
          <select
            id="set-risk"
            className="input"
            value={form.riskProfile}
            onChange={(e) => set('riskProfile', e.target.value)}
          >
            {RISK_PROFILE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="set-session">Default session</label>
          <select
            id="set-session"
            className="input"
            value={form.defaultSession}
            onChange={(e) => set('defaultSession', e.target.value)}
          >
            {DEFAULT_SESSION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="auth-field-error set-status" role="alert">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="set-saved" role="status">
          Preferences saved.
        </p>
      )}

      <Button type="submit" variant="forest" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save preferences'}
      </Button>
    </form>
  );
}
