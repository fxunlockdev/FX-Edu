'use client';

import { useState } from 'react';
import { Button } from '@fxunlock/ui';

export interface SettingsValues {
  readonly supportEmail: string;
  readonly supportUrl: string;
  readonly timezone: string;
  readonly locale: string;
  readonly legalEntity: string;
  readonly disclosures: string;
}

interface SettingsFormProps {
  readonly initial: SettingsValues;
}

const TIMEZONES = ['Europe/Frankfurt', 'Europe/London', 'America/New_York', 'Asia/Singapore'] as const;
const LOCALES = ['en-GB', 'en-US', 'de-DE', 'fr-FR'] as const;

/**
 * Tenant settings form (isolated client leaf). Tenant preferences, legal
 * disclosures and support contact. Saving is STUBBED. When wired, writes go
 * through an RLS-scoped server action so a partner only edits their OWN tenant.
 * TODO: persist tenant settings (org-scoped write).
 */
export function SettingsForm({ initial }: SettingsFormProps) {
  const [values, setValues] = useState<SettingsValues>(initial);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // STUBBED: would write to the tenant settings row (RLS scopes to org_id).
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="pt-stack-lg" aria-label="Tenant settings">
      <section className="pt-panel set-grid" aria-labelledby="prefs-h">
        <h2 id="prefs-h" className="set-span">
          Tenant preferences
        </h2>
        <div className="field">
          <label htmlFor="set-tz">Timezone</label>
          <select id="set-tz" className="input" value={values.timezone} onChange={(e) => set('timezone', e.target.value)}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="set-locale">Default locale</label>
          <select id="set-locale" className="input" value={values.locale} onChange={(e) => set('locale', e.target.value)}>
            {LOCALES.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div className="field set-span">
          <label htmlFor="set-entity">Legal entity name</label>
          <input
            id="set-entity"
            className="input"
            value={values.legalEntity}
            onChange={(e) => set('legalEntity', e.target.value)}
            maxLength={120}
          />
        </div>
      </section>

      <section className="pt-panel set-grid" aria-labelledby="support-h">
        <h2 id="support-h" className="set-span">
          Support contact
        </h2>
        <div className="field">
          <label htmlFor="set-email">Support email</label>
          <input
            id="set-email"
            className="input"
            type="email"
            value={values.supportEmail}
            onChange={(e) => set('supportEmail', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="set-url">Support / help URL</label>
          <input
            id="set-url"
            className="input"
            type="url"
            value={values.supportUrl}
            onChange={(e) => set('supportUrl', e.target.value)}
            autoComplete="off"
          />
        </div>
      </section>

      <section className="pt-panel" aria-labelledby="legal-h">
        <h2 id="legal-h">Legal disclosures</h2>
        <p className="sub">
          Your tenant-specific disclosures. The FX Academy educational-only / risk disclaimer is
          always shown to members and cannot be removed.
        </p>
        <div className="field">
          <label htmlFor="set-legal">Additional disclosures</label>
          <textarea
            id="set-legal"
            className="input"
            rows={4}
            value={values.disclosures}
            onChange={(e) => set('disclosures', e.target.value)}
            maxLength={600}
          />
        </div>
      </section>

      <div className="set-actions">
        <Button type="submit" variant="lime" size="sm">
          Save settings
        </Button>
        {saved ? (
          <span className="set-saved" role="status">
            Saved (preview) — persistence is stubbed.
          </span>
        ) : null}
      </div>
    </form>
  );
}
