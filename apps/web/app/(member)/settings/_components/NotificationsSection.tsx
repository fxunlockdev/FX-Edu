'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/client';
import { saveNotificationPrefs } from '../save-settings';
import {
  NOTIFICATION_PREFS,
  type NotificationPrefKey,
  type NotificationPrefs,
} from '../settings-fields';

/**
 * Notification preferences section (PROJECT.md §8.16). Five toggles, each backed
 * by a boolean column on `notification_preferences`. The Lifecycle Messaging
 * module (§9 module 15) reads these before fan-out, so opting out suppresses the
 * matching email/push.
 *
 * Each toggle is a real `role="switch"` button (keyboard + screen-reader
 * friendly). State is local until "Save preferences" writes the row via the
 * RLS-scoped client.
 */
export function NotificationsSection({ initial }: { initial: NotificationPrefs }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotificationPrefs>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggle(key: NotificationPrefKey) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
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
      const result = await saveNotificationPrefs(supabase, prefs);
      if (!result.ok) {
        setError(result.error ?? 'We could not save your settings. Please try again.');
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="set-panel" aria-labelledby="set-notif-h" onSubmit={submit} aria-busy={submitting}>
      <h2 className="set-ph" id="set-notif-h">
        Notifications
      </h2>
      <p className="set-psub">Choose what you hear about. You can fine-tune these any time.</p>

      <ul className="set-toggle-list">
        {NOTIFICATION_PREFS.map((p) => {
          const on = prefs[p.key];
          return (
            <li className="set-toggle-row" key={p.key}>
              <div className="set-toggle-copy">
                <span className="set-toggle-title" id={`set-sw-label-${p.key}`}>
                  {p.title}
                </span>
                <span className="set-toggle-hint">{p.hint}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-labelledby={`set-sw-label-${p.key}`}
                className={`set-switch${on ? ' on' : ''}`}
                onClick={() => toggle(p.key)}
              >
                <span className="set-switch-knob" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="auth-field-error set-status" role="alert">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="set-saved" role="status">
          Notification settings saved.
        </p>
      )}

      <Button type="submit" variant="forest" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save preferences'}
      </Button>
    </form>
  );
}
