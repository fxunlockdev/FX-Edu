/**
 * Pure referral-link helpers — deterministic so the same input always yields the
 * same code/link (unit-testable; no I/O, no `Date.now()`).
 *
 * The affiliate's public-facing **referral code** is derived from their user id.
 * In production the code is minted + persisted server-side (so it is stable,
 * unique, and tamper-resistant — see attribution notes below); this client-safe
 * derivation is the deterministic fallback used while that backend is stubbed.
 */

/** Where referral links point. Real value comes from env at wire-up time. */
export const REFERRAL_BASE_URL = 'https://fxacademy.com';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
const CODE_LENGTH = 6;

/**
 * Derive a short, stable, human-readable referral code from a user id.
 *
 * Deterministic FNV-1a hash → base32-ish alphabet. This is a *display fallback*:
 * the authoritative code is assigned and uniqueness-checked server-side. Never
 * treat a client-derived code as trusted for attribution.
 *
 * @param userId the affiliate's auth user id (or any stable seed).
 * @returns a 6-char uppercase code, e.g. `"FX-7KQ2M9"` once prefixed by the UI.
 */
export function deriveReferralCode(userId: string | null | undefined): string {
  const seed = (userId ?? 'preview-affiliate').trim() || 'preview-affiliate';

  // FNV-1a 32-bit — stable across runtimes, good avalanche for short ids.
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  let code = '';
  let acc = hash;
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[acc % CODE_ALPHABET.length];
    acc = Math.floor(acc / CODE_ALPHABET.length) || (hash ^ (i + 1)) >>> 0;
  }
  return code;
}

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
}

/**
 * Build a referral URL: `${base}/?ref=CODE` plus any non-empty UTM params.
 * Uses `URLSearchParams` so values are correctly encoded — no string-concat XSS.
 *
 * @param code  the referral code (already-derived, uppercase).
 * @param utm   optional UTM campaign parameters.
 * @param base  origin to build against (defaults to {@link REFERRAL_BASE_URL}).
 */
export function buildReferralLink(
  code: string,
  utm: UtmParams = {},
  base: string = REFERRAL_BASE_URL,
): string {
  const params = new URLSearchParams({ ref: code });
  if (utm.source?.trim()) params.set('utm_source', utm.source.trim());
  if (utm.medium?.trim()) params.set('utm_medium', utm.medium.trim());
  if (utm.campaign?.trim()) params.set('utm_campaign', utm.campaign.trim());
  return `${base.replace(/\/$/, '')}/?${params.toString()}`;
}
