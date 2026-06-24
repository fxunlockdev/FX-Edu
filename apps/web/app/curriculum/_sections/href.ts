/**
 * Builds a curriculum CTA href that forwards a valid `?ref=` referral code so
 * attribution survives the click into checkout / signup.
 *
 * Mirrors the pricing page convention (`app/pricing/_sections/href.ts`). `ref`
 * is the already-sanitized code (see `@/lib/referral`); when present it is
 * URL-encoded before being appended. The base path may already carry a query
 * string (e.g. `/checkout?plan=pro`), in which case we append with `&`.
 */
export function withRef(href: string, ref: string | null): string {
  if (!ref) return href;
  const separator = href.includes('?') ? '&' : '?';
  return `${href}${separator}ref=${encodeURIComponent(ref)}`;
}
