/**
 * Referral-code handling for the public marketing site (PROJECT.md §9 module 1).
 *
 * The `?ref=` query value is attacker-controlled and is rendered back to the
 * user, so it MUST be validated + sanitized before display (no reflected XSS).
 * We allow only a tight whitelist and cap the length, mirroring the design
 * package's `^[a-z0-9 ]{2,30}$` guard.
 */

export const REFERRAL_COOKIE = 'fx_ref';
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60-day cookie (PROJECT.md §9 module 14)

/** Lowercase/uppercase letters, digits, and single spaces; 2–30 chars. */
const REFERRAL_PATTERN = /^[a-z0-9 ]{2,30}$/i;

/**
 * Returns a safe referral code, or `null` when the input is missing/invalid.
 *
 * Steps: coerce to string, trim, collapse internal whitespace, then validate
 * against the whitelist. Invalid input yields `null` (no banner, no cookie).
 */
export function sanitizeRef(raw: string | string[] | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;

  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return null;

  const collapsed = value.trim().replace(/\s+/g, ' ');
  if (!REFERRAL_PATTERN.test(collapsed)) return null;

  return collapsed;
}
