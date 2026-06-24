/**
 * Builds a CTA href that forwards a valid, already-sanitized `?ref=` referral
 * code so attribution survives the click. The base path may already carry a
 * query string (e.g. `/checkout?plan=pro`), in which case we append with `&`.
 *
 * `ref` is the sanitized code (see `@/lib/referral`). Single source of truth —
 * marketing route sections re-export this rather than duplicating it.
 */
export function withRef(href: string, ref: string | null): string {
  if (!ref) return href;
  const separator = href.includes('?') ? '&' : '?';
  return `${href}${separator}ref=${encodeURIComponent(ref)}`;
}
