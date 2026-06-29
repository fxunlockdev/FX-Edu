/**
 * Public certificate verification lookup (M9 / PROJECT.md §9 · §8.14).
 *
 * MINIMAL DISCLOSURE is the whole point of this surface: given an opaque
 * verification ID, a verifier (employer, partner — anyone with the link) may
 * confirm ONLY that a certificate is valid and see the tier/name, issue date,
 * and a minimal learner identity (first name + last initial). Nothing else
 * about the learner is ever exposed here (PROJECT.md §9 🔒: "verify URL reveals
 * only validity + minimal identity").
 *
 * Verification is SERVER-AUTHORITATIVE. This module runs only in RSC / server
 * context. It attempts an RLS-safe public read; until that read path is wired
 * it degrades to a deterministic stub so the page renders end-to-end.
 */
import { createClient } from '@/lib/supabase/server';

/** What a verifier is allowed to see. Intentionally tiny. */
export interface VerificationResult {
  readonly valid: boolean;
  /** Certificate / course name, e.g. `Forex Foundations`. (valid only) */
  readonly name?: string;
  /** Tier label, e.g. `Tier 1`. (valid only) */
  readonly tierLabel?: string;
  /** ISO issue date. (valid only) */
  readonly issuedAt?: string;
  /**
   * Minimal learner identity — first name + last initial, e.g. `Alex R.`.
   * Computed server-side; the full surname/email is never sent to the client.
   */
  readonly learner?: string;
}

const INVALID: VerificationResult = { valid: false };

/** A verification ID is an opaque token; accept a conservative charset only. */
const ID_PATTERN = /^[A-Za-z0-9_-]{6,128}$/;

/**
 * Reduce a full display name to a minimal identity ("Alex Rivera" → "Alex R.").
 * Single-word names pass through unchanged; empty input yields undefined.
 */
export function minimalIdentity(fullName: string | null | undefined): string | undefined {
  const trimmed = (fullName ?? '').trim().replace(/\s+/g, ' ');
  if (!trimmed) return undefined;
  const parts = trimmed.split(' ');
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = (parts[parts.length - 1] ?? '').charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

interface PublicCertRow {
  readonly name: string | null;
  readonly tier_label: string | null;
  readonly issued_at: string | null;
  readonly learner_name: string | null;
}

/**
 * Look up a certificate by its public verification ID.
 *
 * Returns `{ valid: false }` for an unknown, malformed, or revoked ID — the
 * page renders an identical "not valid" state for all of these so the endpoint
 * leaks nothing (no "exists but revoked" oracle).
 *
 * Read strategy: query a minimal-disclosure public view/RPC that exposes ONLY
 * the four allowed fields for valid, non-revoked certificates. Such a read must
 * be safe for an anonymous caller (the verify page is public), so it relies on
 * a dedicated `public` SECURITY-checked path — NOT direct table access under a
 * member's RLS. If the read path isn't deployed yet, we fall back to a stub.
 */
export async function verifyCertificate(rawId: string): Promise<VerificationResult> {
  const id = (rawId ?? '').trim();
  if (!ID_PATTERN.test(id)) return INVALID;

  try {
    const supabase = await createClient();

    // TODO: wire server-side verification lookup. Replace this with a call to a
    // minimal-disclosure public read — e.g. an RPC `verify_certificate(id)` or a
    // `public_certificate_verifications` view exposing ONLY the four allowed
    // fields for valid, non-revoked certificates. It must be queryable by an
    // anonymous caller and must NOT expose user_id, email, org_id, or any extra
    // column. Direct `.from('certificates')` access is intentionally avoided
    // here because that table is RLS-scoped to the owning member.
    const { data, error } = await supabase
      .from('public_certificate_verifications')
      .select('name, tier_label, issued_at, learner_name')
      .eq('verification_id', id)
      .maybeSingle();

    if (error) {
      // Read path not deployed (or table missing) → deterministic stub so the
      // page is demonstrable without leaking a real-vs-fake oracle.
      return stubVerify(id);
    }

    const row = (data as PublicCertRow | null) ?? null;
    if (!row || !row.name) return INVALID;

    return {
      valid: true,
      name: row.name,
      tierLabel: row.tier_label ?? undefined,
      issuedAt: row.issued_at ?? undefined,
      learner: minimalIdentity(row.learner_name),
    };
  } catch {
    return stubVerify(id);
  }
}

/**
 * Deterministic offline stub used only until the public read path is wired.
 * A single demo ID resolves to a valid certificate; everything else is
 * invalid. This proves the minimal-disclosure UI without a database.
 *
 * // TODO: remove once `verifyCertificate` reads the real public lookup.
 */
function stubVerify(id: string): VerificationResult {
  if (id === 'FXA-DEMO-T1-2025') {
    return {
      valid: true,
      name: 'Forex Foundations',
      tierLabel: 'Tier 1',
      issuedAt: '2025-03-04',
      learner: minimalIdentity('Alex Rivera'),
    };
  }
  return INVALID;
}
