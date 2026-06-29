'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { buildReferralLink, type UtmParams } from '../_components/referral';

interface ReferralBuilderProps {
  /** Server-derived referral code (display-safe; authoritative value is server-minted). */
  code: string;
  /** Origin to build links against (server-provided so it stays env-driven). */
  baseUrl: string;
}

type CopyKey = 'link' | 'code' | null;

/**
 * Interactive referral + UTM builder (client leaf).
 *
 * Owns only local UI state: the UTM campaign fields, the derived link, and the
 * transient "copied" feedback. The referral CODE itself is derived server-side
 * and passed in — never minted on the client (attribution must stay
 * tamper-resistant; see the page's security note).
 */
export function ReferralBuilder({ code, baseUrl }: ReferralBuilderProps) {
  const [utm, setUtm] = useState<UtmParams>({ source: '', medium: '', campaign: '' });
  const [copied, setCopied] = useState<CopyKey>(null);

  const link = useMemo(() => buildReferralLink(code, utm, baseUrl), [code, utm, baseUrl]);

  async function copy(value: string, key: Exclude<CopyKey, null>) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      // Clipboard can be blocked (insecure context / permissions). Fail quietly —
      // the value is visible and selectable in the field as a manual fallback.
      setCopied(null);
    }
  }

  const set = (field: keyof UtmParams) => (e: ChangeEvent<HTMLInputElement>) =>
    setUtm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="aff-grid2">
      <div className="aff-panel">
        <p className="ph">Your referral code &amp; link</p>
        <p className="sub">Share this anywhere. Attribution is tracked server-side from the link.</p>

        <div className="aff-code-row">
          <span className="aff-code" aria-label="Your referral code">
            {code}
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(code, 'code')}>
            {copied === 'code' ? 'Copied' : 'Copy code'}
          </button>
        </div>

        <div className="field" style={{ marginTop: 18 }}>
          <label htmlFor="aff-ref-link">Referral link</label>
          <div className="aff-link-box">
            <input
              id="aff-ref-link"
              className="input"
              value={link}
              readOnly
              onFocus={(e) => e.currentTarget.select()}
            />
            <button type="button" className="btn btn-lime btn-sm" onClick={() => copy(link, 'link')}>
              {copied === 'link' ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>

        <div className="aff-share">
          <div
            className="aff-qr"
            role="img"
            aria-label="QR code placeholder for your referral link"
          >
            QR / share
            <br />
            coming soon
          </div>
          <p className="muted" style={{ fontSize: 12.5, maxWidth: 220, margin: 0 }}>
            {/* TODO: render a real QR (server-rendered SVG) + Web Share API trigger */}
            A scannable QR code and one-tap share will appear here once asset
            generation is wired.
          </p>
        </div>
      </div>

      <div className="aff-panel">
        <p className="ph">Campaign (UTM) builder</p>
        <p className="sub">Add UTM tags to attribute traffic to a specific channel or campaign.</p>

        <div className="aff-form" style={{ gap: 14 }}>
          <div className="field">
            <label htmlFor="utm-source">utm_source</label>
            <input
              id="utm-source"
              className="input"
              placeholder="newsletter, youtube, instagram…"
              value={utm.source ?? ''}
              onChange={set('source')}
            />
          </div>
          <div className="field">
            <label htmlFor="utm-medium">utm_medium</label>
            <input
              id="utm-medium"
              className="input"
              placeholder="email, social, cpc…"
              value={utm.medium ?? ''}
              onChange={set('medium')}
            />
          </div>
          <div className="field">
            <label htmlFor="utm-campaign">utm_campaign</label>
            <input
              id="utm-campaign"
              className="input"
              placeholder="spring-launch, q3-webinar…"
              value={utm.campaign ?? ''}
              onChange={set('campaign')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
