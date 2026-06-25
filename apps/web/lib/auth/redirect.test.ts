import { describe, it, expect } from 'vitest';
import { safeRedirectPath } from './redirect';

describe('safeRedirectPath', () => {
  it('accepts a simple root-relative path', () => {
    expect(safeRedirectPath('/dashboard', '/fallback')).toBe('/dashboard');
    expect(safeRedirectPath('/checkout?plan=pro&step=plan', '/fallback')).toBe(
      '/checkout?plan=pro&step=plan',
    );
  });

  it('takes the first entry for array input', () => {
    expect(safeRedirectPath(['/dashboard', '/evil'], '/fallback')).toBe('/dashboard');
  });

  it('falls back for missing/empty input', () => {
    expect(safeRedirectPath(undefined, '/fallback')).toBe('/fallback');
    expect(safeRedirectPath(null, '/fallback')).toBe('/fallback');
    expect(safeRedirectPath('', '/fallback')).toBe('/fallback');
  });

  it('rejects protocol-relative and absolute URLs (open redirect)', () => {
    expect(safeRedirectPath('//evil.com', '/fallback')).toBe('/fallback');
    expect(safeRedirectPath('https://evil.com', '/fallback')).toBe('/fallback');
    expect(safeRedirectPath('http://evil.com/path', '/fallback')).toBe('/fallback');
    expect(safeRedirectPath('/\\evil.com', '/fallback')).toBe('/fallback');
  });

  it('rejects paths that smuggle a scheme or control chars', () => {
    expect(safeRedirectPath('/path://evil', '/fallback')).toBe('/fallback');
    expect(safeRedirectPath('/path\ninjection', '/fallback')).toBe('/fallback');
  });

  it('rejects non-root-relative values', () => {
    expect(safeRedirectPath('dashboard', '/fallback')).toBe('/fallback');
    expect(safeRedirectPath('javascript:alert(1)', '/fallback')).toBe('/fallback');
  });
});
