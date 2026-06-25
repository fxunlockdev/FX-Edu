/**
 * Open-redirect guard. A `?redirect=` value is attacker-controlled, so we only
 * honor same-site, absolute-path destinations (must start with a single `/`,
 * must not start with `//` or `/\`, no scheme, no host). Anything else falls
 * back to the provided default. (ENGINEERING.md: never trust external data.)
 */
export function safeRedirectPath(
  raw: string | string[] | null | undefined,
  fallback: string,
): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string' || value.length === 0) return fallback;

  // Must be a root-relative path, not a protocol-relative or backslash trick.
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;

  // Reject anything that smuggles a scheme or control characters.
  if (value.includes('://') || /[\x00-\x1f]/.test(value)) return fallback;

  return value;
}
