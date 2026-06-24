import { describe, it, expect } from 'vitest';
import { sanitizeRef, REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE } from './referral';

describe('sanitizeRef', () => {
  it('accepts a simple alphanumeric code', () => {
    expect(sanitizeRef('jordan')).toBe('jordan');
    expect(sanitizeRef('abc123')).toBe('abc123');
  });

  it('allows letters, digits, and single internal spaces', () => {
    expect(sanitizeRef('Jordan M')).toBe('Jordan M');
  });

  it('trims surrounding whitespace and collapses internal runs', () => {
    expect(sanitizeRef('  jordan   m  ')).toBe('jordan m');
  });

  it('takes the first entry when given an array (duplicate query keys)', () => {
    expect(sanitizeRef(['jordan', 'evil'])).toBe('jordan');
  });

  it('returns null for null/undefined/empty input', () => {
    expect(sanitizeRef(null)).toBeNull();
    expect(sanitizeRef(undefined)).toBeNull();
    expect(sanitizeRef('')).toBeNull();
    expect(sanitizeRef('   ')).toBeNull();
  });

  it('rejects values shorter than 2 chars', () => {
    expect(sanitizeRef('a')).toBeNull();
  });

  it('rejects values longer than 30 chars', () => {
    expect(sanitizeRef('a'.repeat(31))).toBeNull();
  });

  it('rejects XSS / markup payloads (no special characters allowed)', () => {
    expect(sanitizeRef('<script>alert(1)</script>')).toBeNull();
    expect(sanitizeRef('jordan<b>')).toBeNull();
    expect(sanitizeRef('"><img src=x>')).toBeNull();
    expect(sanitizeRef('a;b')).toBeNull();
    expect(sanitizeRef('a&b')).toBeNull();
    expect(sanitizeRef('javascript:alert(1)')).toBeNull();
  });

  it('exposes the cookie name and a 60-day max-age', () => {
    expect(REFERRAL_COOKIE).toBe('fx_ref');
    expect(REFERRAL_COOKIE_MAX_AGE).toBe(60 * 60 * 24 * 60);
  });
});
