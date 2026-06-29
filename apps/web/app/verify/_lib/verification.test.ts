import { describe, expect, it } from 'vitest';
import { minimalIdentity } from './verification';

/**
 * Minimal-disclosure identity tests (M9 / PROJECT.md §9 🔒 · §8.14).
 * The verify page must reveal ONLY first name + last initial — never the full
 * surname. This guards that reduction. (The DB lookup itself is exercised via
 * the page; here we lock down the privacy-critical pure helper.)
 */
describe('minimalIdentity', () => {
  it('reduces a full name to first name + last initial', () => {
    expect(minimalIdentity('Alex Rivera')).toBe('Alex R.');
  });

  it('uses only the FINAL token for the initial (multi-part surnames)', () => {
    expect(minimalIdentity('Maria del Carmen Vega')).toBe('Maria V.');
  });

  it('passes a single-word name through unchanged', () => {
    expect(minimalIdentity('Cher')).toBe('Cher');
  });

  it('collapses extra whitespace before reducing', () => {
    expect(minimalIdentity('  Jordan   Tan  ')).toBe('Jordan T.');
  });

  it('uppercases the last initial', () => {
    expect(minimalIdentity('sam lee')).toBe('sam L.');
  });

  it('returns undefined for empty or nullish input', () => {
    expect(minimalIdentity('')).toBeUndefined();
    expect(minimalIdentity('   ')).toBeUndefined();
    expect(minimalIdentity(null)).toBeUndefined();
    expect(minimalIdentity(undefined)).toBeUndefined();
  });

  it('never leaks the full surname', () => {
    const out = minimalIdentity('Alex Rivera');
    expect(out).not.toContain('Rivera');
  });
});
