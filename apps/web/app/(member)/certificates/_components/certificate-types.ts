/**
 * Certificate domain types and pure helpers (M9 / PROJECT.md §9 · §8.14).
 *
 * Certificates recognize EDUCATION, not trading results — every label here is
 * worded accordingly. The data model mirrors the `certificates` table: one row
 * per (user, tier) certificate, minted SERVER-SIDE only (a worker writes the
 * row after server-verified tier completion). Nothing here mints; the page only
 * reads and renders.
 */

/** Lifecycle state of a tier certificate for the viewing user. */
export type CertificateStatus = 'earned' | 'progress' | 'locked';

/**
 * One certificate as the member page consumes it. `earned` rows carry the
 * verification fields; `progress`/`locked` rows carry only display hints.
 */
export interface CertificateView {
  /** Stable tier slug, e.g. `tier-1`. Used as the React key. */
  readonly tier: string;
  /** Human tier label, e.g. `Tier 1`. */
  readonly tierLabel: string;
  /** Certificate / course name, e.g. `Forex Foundations`. */
  readonly name: string;
  readonly status: CertificateStatus;
  /** Percent complete (0–100) for the in-progress state. */
  readonly progressPct?: number;
  /** Server-issued ISO date the certificate was minted (earned only). */
  readonly issuedAt?: string;
  /**
   * Public verification ID — the opaque token that appears in the verify URL
   * (`/verify/[id]`). Never the row's primary key; safe to expose. Earned only.
   */
  readonly verificationId?: string;
  /** Display name printed on the certificate (the learner). Earned only. */
  readonly learnerName?: string;
}

/** Page-level summary stats shown above the certificate grid. */
export interface CertificateSummary {
  readonly earnedCount: number;
  /** Overall course progress across all tiers, 0–100. */
  readonly overallProgressPct: number;
  /** Tiers not yet earned (in-progress + locked). */
  readonly tiersRemaining: number;
}

/**
 * Raw `certificates` row shape (snake_case, as returned by Supabase). Optional
 * everywhere because the table may not be deployed yet, in which case the read
 * degrades to an all-locked catalog. Never trust these values for gating — they
 * are display data only; minting and verification are server-authoritative.
 */
export interface CertificateRow {
  readonly tier: string | null;
  readonly status: string | null;
  readonly progress_pct: number | null;
  readonly issued_at: string | null;
  readonly verification_id: string | null;
  readonly learner_name: string | null;
}

/** Columns the page selects — keep in sync with {@link CertificateRow}. */
export const CERTIFICATE_SELECT_COLUMNS =
  'tier, status, progress_pct, issued_at, verification_id, learner_name' as const;

/**
 * The fixed five-tier curriculum catalog (PROJECT.md §9 — Entry → Psychology).
 * The page overlays the user's earned/in-progress rows onto this catalog so
 * tiers the user hasn't reached still render as designed "locked" cards.
 */
export const TIER_CATALOG: ReadonlyArray<{
  readonly tier: string;
  readonly tierLabel: string;
  readonly name: string;
}> = [
  { tier: 'tier-1', tierLabel: 'Tier 1', name: 'Forex Foundations' },
  { tier: 'tier-2', tierLabel: 'Tier 2', name: 'Market Structure & Liquidity' },
  { tier: 'tier-3', tierLabel: 'Tier 3', name: 'Risk & Trade Management' },
  { tier: 'tier-4', tierLabel: 'Tier 4', name: 'Strategy Development' },
  { tier: 'tier-5', tierLabel: 'Tier 5', name: 'Trading Psychology' },
];

const VALID_STATUS = new Set<CertificateStatus>(['earned', 'progress', 'locked']);

/** Narrow an untrusted status string to a known {@link CertificateStatus}. */
function normalizeStatus(value: string | null): CertificateStatus | null {
  if (value && VALID_STATUS.has(value as CertificateStatus)) {
    return value as CertificateStatus;
  }
  return null;
}

/** Clamp an untrusted percent into 0–100, or undefined when absent/invalid. */
function clampPct(value: number | null): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Merge the user's rows onto the fixed tier catalog, producing one
 * {@link CertificateView} per tier in curriculum order.
 *
 * Rules (all defensive — external data is never trusted):
 * - A matching `earned` row needs a `verification_id` to render as earned;
 *   without one it degrades to in-progress (we never fabricate a verify URL).
 * - Unknown/missing rows render as `locked` (the safe default).
 * - The first locked tier after the user's furthest progress is "next"; deeper
 *   tiers stay locked. We keep this simple: any non-earned/non-progress tier is
 *   locked, matching the design's gated catalog.
 */
export function buildCertificateViews(
  rows: ReadonlyArray<CertificateRow>,
  learnerName: string,
): CertificateView[] {
  const byTier = new Map<string, CertificateRow>();
  for (const row of rows) {
    if (row.tier) byTier.set(row.tier, row);
  }

  return TIER_CATALOG.map((entry) => {
    const row = byTier.get(entry.tier);
    const status = row ? normalizeStatus(row.status) : null;
    const base = { tier: entry.tier, tierLabel: entry.tierLabel, name: entry.name };

    if (status === 'earned' && row?.verification_id) {
      return {
        ...base,
        status: 'earned' as const,
        issuedAt: row.issued_at ?? undefined,
        verificationId: row.verification_id,
        learnerName: row.learner_name ?? learnerName,
      };
    }

    if (status === 'progress' || (status === 'earned' && !row?.verification_id)) {
      return {
        ...base,
        status: 'progress' as const,
        progressPct: clampPct(row?.progress_pct ?? null) ?? 0,
      };
    }

    return { ...base, status: 'locked' as const };
  });
}

/** Compute the header summary from the resolved per-tier views. */
export function summarize(views: ReadonlyArray<CertificateView>): CertificateSummary {
  const earnedCount = views.filter((v) => v.status === 'earned').length;
  const total = views.length || 1;

  // Each earned tier counts as 100%, an in-progress tier contributes its pct,
  // locked tiers contribute 0. Overall progress is the average across tiers.
  const sum = views.reduce((acc, v) => {
    if (v.status === 'earned') return acc + 100;
    if (v.status === 'progress') return acc + (v.progressPct ?? 0);
    return acc;
  }, 0);

  return {
    earnedCount,
    overallProgressPct: Math.round(sum / total),
    tiersRemaining: total - earnedCount,
  };
}

/** Absolute-ish public verify path for an earned certificate. */
export function verifyPath(verificationId: string): string {
  return `/verify/${encodeURIComponent(verificationId)}`;
}

/** Format an ISO date as a human "Issued Mon D, YYYY" label. */
export function formatIssued(iso: string | undefined): string {
  if (!iso) return 'Issued';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Issued';
  return `Issued ${date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })}`;
}
