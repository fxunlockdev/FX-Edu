import { describe, expect, it } from 'vitest';
import {
  buildCertificateViews,
  summarize,
  verifyPath,
  formatIssued,
  TIER_CATALOG,
  type CertificateRow,
} from './certificate-types';

/**
 * Pure certificate domain tests (M9 / PROJECT.md §9 module 9 · §8.14).
 * Deterministic, no I/O. Focus areas: catalog overlay, defensive narrowing of
 * untrusted rows, and summary math.
 */
function row(overrides: Partial<CertificateRow> = {}): CertificateRow {
  return {
    tier: 'tier-1',
    status: 'earned',
    progress_pct: null,
    issued_at: '2025-03-04',
    verification_id: 'FXA-T1-ABC123',
    learner_name: 'Alex Rivera',
    ...overrides,
  };
}

describe('buildCertificateViews', () => {
  it('returns one view per catalog tier, in order', () => {
    const views = buildCertificateViews([], 'Sam Lee');
    expect(views).toHaveLength(TIER_CATALOG.length);
    expect(views.map((v) => v.tier)).toEqual(TIER_CATALOG.map((t) => t.tier));
  });

  it('renders every tier as locked when the user has no rows', () => {
    const views = buildCertificateViews([], 'Sam Lee');
    expect(views.every((v) => v.status === 'locked')).toBe(true);
  });

  it('overlays an earned row with its verification fields', () => {
    const views = buildCertificateViews([row()], 'Fallback Name');
    const tier1 = views.find((v) => v.tier === 'tier-1');
    expect(tier1?.status).toBe('earned');
    expect(tier1?.verificationId).toBe('FXA-T1-ABC123');
    expect(tier1?.issuedAt).toBe('2025-03-04');
    expect(tier1?.learnerName).toBe('Alex Rivera');
  });

  it('falls back to the auth display name when the row has no learner_name', () => {
    const views = buildCertificateViews([row({ learner_name: null })], 'Fallback Name');
    const tier1 = views.find((v) => v.tier === 'tier-1');
    expect(tier1?.learnerName).toBe('Fallback Name');
  });

  it('degrades an "earned" row WITHOUT a verification id to in-progress (never fabricate a verify URL)', () => {
    const views = buildCertificateViews([row({ verification_id: null })], 'Sam Lee');
    const tier1 = views.find((v) => v.tier === 'tier-1');
    expect(tier1?.status).toBe('progress');
    expect(tier1?.verificationId).toBeUndefined();
  });

  it('clamps an out-of-range progress percentage', () => {
    const views = buildCertificateViews(
      [row({ tier: 'tier-3', status: 'progress', progress_pct: 240, verification_id: null })],
      'Sam Lee',
    );
    const tier3 = views.find((v) => v.tier === 'tier-3');
    expect(tier3?.status).toBe('progress');
    expect(tier3?.progressPct).toBe(100);
  });

  it('treats an unknown status string as locked', () => {
    const views = buildCertificateViews([row({ status: 'banana' })], 'Sam Lee');
    const tier1 = views.find((v) => v.tier === 'tier-1');
    expect(tier1?.status).toBe('locked');
  });

  it('ignores rows for tiers outside the catalog', () => {
    const views = buildCertificateViews([row({ tier: 'tier-99' })], 'Sam Lee');
    expect(views.every((v) => v.status === 'locked')).toBe(true);
  });
});

describe('summarize', () => {
  it('counts earned certs and computes remaining tiers', () => {
    const views = buildCertificateViews(
      [
        row({ tier: 'tier-1' }),
        row({ tier: 'tier-2', verification_id: 'FXA-T2-XYZ' }),
        row({ tier: 'tier-3', status: 'progress', progress_pct: 50, verification_id: null }),
      ],
      'Sam Lee',
    );
    const summary = summarize(views);
    expect(summary.earnedCount).toBe(2);
    expect(summary.tiersRemaining).toBe(TIER_CATALOG.length - 2);
  });

  it('averages overall progress: earned=100, progress=pct, locked=0', () => {
    // 2 earned (100 each) + 1 progress at 50 + 2 locked (0) over 5 tiers
    // = (100 + 100 + 50) / 5 = 50
    const views = buildCertificateViews(
      [
        row({ tier: 'tier-1' }),
        row({ tier: 'tier-2', verification_id: 'FXA-T2-XYZ' }),
        row({ tier: 'tier-3', status: 'progress', progress_pct: 50, verification_id: null }),
      ],
      'Sam Lee',
    );
    expect(summarize(views).overallProgressPct).toBe(50);
  });

  it('reports zero progress for a fresh learner', () => {
    const summary = summarize(buildCertificateViews([], 'Sam Lee'));
    expect(summary).toEqual({
      earnedCount: 0,
      overallProgressPct: 0,
      tiersRemaining: TIER_CATALOG.length,
    });
  });
});

describe('verifyPath', () => {
  it('builds the public verify path and url-encodes the id', () => {
    expect(verifyPath('FXA-T1-ABC')).toBe('/verify/FXA-T1-ABC');
    expect(verifyPath('a b/c')).toBe('/verify/a%20b%2Fc');
  });
});

describe('formatIssued', () => {
  it('formats a valid ISO date', () => {
    expect(formatIssued('2025-03-04')).toMatch(/^Issued [A-Z][a-z]{2} \d{1,2}, 2025$/);
  });

  it('degrades gracefully for missing/invalid input', () => {
    expect(formatIssued(undefined)).toBe('Issued');
    expect(formatIssued('not-a-date')).toBe('Issued');
  });
});
