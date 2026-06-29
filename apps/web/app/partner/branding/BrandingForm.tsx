'use client';

import { useState } from 'react';
import { Button } from '@fxunlock/ui';

export interface BrandingValues {
  readonly displayName: string;
  readonly tagline: string;
  readonly logoText: string;
  readonly faviconText: string;
  readonly primaryColor: string;
  readonly accentColor: string;
  readonly theme: 'light' | 'dark';
  readonly footerLegal: string;
}

interface BrandingFormProps {
  readonly initial: BrandingValues;
}

/**
 * Branding editor (isolated client leaf). Holds local form state and renders a
 * LIVE preview of how the tenant's logo lockup + CTA will look. Saving is
 * STUBBED — no persistence is wired yet.
 *
 * TODO: persist branding to the tenant theme via an RLS-scoped server action
 *       (writes are scoped to the partner's own org_id only).
 */
export function BrandingForm({ initial }: BrandingFormProps) {
  const [values, setValues] = useState<BrandingValues>(initial);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof BrandingValues>(key: K, value: BrandingValues[K]) {
    // Immutable update — never mutate the previous state object.
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // STUBBED: would call a server action that writes to the tenant theme
    // (RLS scopes the write to this partner's org_id).
    setSaved(true);
  }

  return (
    <div className="brand-grid">
      <form className="pt-panel brand-form" onSubmit={onSubmit} aria-label="Branding settings">
        <div className="field">
          <label htmlFor="b-name">Academy display name</label>
          <input
            id="b-name"
            className="input"
            value={values.displayName}
            onChange={(e) => set('displayName', e.target.value)}
            maxLength={60}
          />
        </div>

        <div className="field">
          <label htmlFor="b-tag">Tagline</label>
          <input
            id="b-tag"
            className="input"
            value={values.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            maxLength={80}
          />
        </div>

        <div className="brand-row">
          <div className="field">
            <label htmlFor="b-logo">Logo monogram</label>
            <input
              id="b-logo"
              className="input"
              value={values.logoText}
              onChange={(e) => set('logoText', e.target.value.slice(0, 3).toUpperCase())}
              maxLength={3}
            />
            <span className="brand-hint">Upload SVG/PNG when storage is wired — monogram shown in preview.</span>
          </div>
          <div className="field">
            <label htmlFor="b-fav">Favicon initials</label>
            <input
              id="b-fav"
              className="input"
              value={values.faviconText}
              onChange={(e) => set('faviconText', e.target.value.slice(0, 2).toUpperCase())}
              maxLength={2}
            />
          </div>
        </div>

        <div className="brand-row">
          <div className="field">
            <label htmlFor="b-primary-hex">Primary color</label>
            <span className="brand-color">
              <input
                id="b-primary"
                type="color"
                value={values.primaryColor}
                onChange={(e) => set('primaryColor', e.target.value)}
                aria-label="Primary color picker"
              />
              <input
                id="b-primary-hex"
                className="input"
                value={values.primaryColor}
                onChange={(e) => set('primaryColor', e.target.value)}
              />
            </span>
          </div>
          <div className="field">
            <label htmlFor="b-accent-hex">Accent color</label>
            <span className="brand-color">
              <input
                id="b-accent"
                type="color"
                value={values.accentColor}
                onChange={(e) => set('accentColor', e.target.value)}
                aria-label="Accent color picker"
              />
              <input
                id="b-accent-hex"
                className="input"
                value={values.accentColor}
                onChange={(e) => set('accentColor', e.target.value)}
              />
            </span>
          </div>
        </div>

        <fieldset className="field brand-theme">
          <legend>Default appearance</legend>
          <div className="brand-segs" role="radiogroup" aria-label="Default appearance">
            {(['light', 'dark'] as const).map((opt) => (
              <label key={opt} className={values.theme === opt ? 'brand-seg active' : 'brand-seg'}>
                <input
                  type="radio"
                  name="theme"
                  value={opt}
                  checked={values.theme === opt}
                  onChange={() => set('theme', opt)}
                />
                {opt === 'light' ? 'Light' : 'Dark'}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="b-legal">Legal / footer copy</label>
          <textarea
            id="b-legal"
            className="input"
            rows={3}
            value={values.footerLegal}
            onChange={(e) => set('footerLegal', e.target.value)}
            maxLength={400}
          />
          <span className="brand-hint">
            Educational-only framing is required and cannot be removed from the FX Academy risk
            disclaimer.
          </span>
        </div>

        <div className="brand-actions">
          <Button type="submit" variant="lime" size="sm">
            Save branding
          </Button>
          {saved ? (
            <span className="brand-saved" role="status">
              Saved (preview) — persistence is stubbed.
            </span>
          ) : null}
        </div>
      </form>

      <BrandingPreview values={values} />
    </div>
  );
}

/** Live, compositor-friendly preview of the branded member lockup. */
function BrandingPreview({ values }: { values: BrandingValues }) {
  const dark = values.theme === 'dark';
  return (
    <aside className="pt-panel brand-preview" aria-label="Live preview">
      <h2>Live preview</h2>
      <p className="sub">How members see your brand. Updates as you type.</p>

      <div
        className="brand-canvas"
        data-theme={values.theme}
        style={{
          background: dark ? '#0f1d16' : '#ffffff',
          color: dark ? '#f1f5ef' : '#161a17',
        }}
      >
        <div className="brand-lockup">
          <span className="brand-mark" style={{ background: values.primaryColor }}>
            {values.logoText || 'YB'}
          </span>
          <span className="brand-words">
            <span className="brand-title">{values.displayName || 'Your Academy'}</span>
            <span className="brand-tag" style={{ color: dark ? '#b3c4b8' : '#444b44' }}>
              {values.tagline || 'Powered by FX Academy'}
            </span>
          </span>
        </div>
        <button
          type="button"
          className="brand-cta"
          style={{ background: values.accentColor, color: contrastInk(values.accentColor) }}
        >
          Start learning
        </button>
      </div>

      <p className="brand-favnote">
        Favicon: <span className="brand-fav" style={{ background: values.accentColor, color: contrastInk(values.accentColor) }}>{values.faviconText || 'YA'}</span>
      </p>
    </aside>
  );
}

/** Pick black/white ink for a hex background (simple luminance test). */
function contrastInk(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const capture = m?.[1];
  if (!capture) return '#fff';
  const n = parseInt(capture, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#141f00' : '#ffffff';
}
