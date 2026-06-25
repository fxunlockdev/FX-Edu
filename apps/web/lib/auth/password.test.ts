import { describe, it, expect } from 'vitest';
import { scorePassword, MIN_PASSWORD_LENGTH } from './password';

describe('scorePassword', () => {
  it('returns empty for an empty string', () => {
    const result = scorePassword('');
    expect(result.strength).toBe('empty');
    expect(result.score).toBe(0);
    expect(result.label).toBe('');
  });

  it('caps short passwords at weak regardless of variety', () => {
    const result = scorePassword('Aa1!'); // varied but < min length
    expect(result.strength).toBe('weak');
    expect(result.score).toBe(1);
  });

  it('rates a long, varied password as strong', () => {
    const result = scorePassword('Abcdef123!@#');
    expect(result.strength).toBe('strong');
    expect(result.score).toBe(4);
    expect(result.label).toBe('Strong');
  });

  it('rates a min-length all-lowercase password as weak', () => {
    const result = scorePassword('abcdefgh');
    expect(result.strength).toBe('weak');
  });

  it('rates a min-length mixed password as fair or better', () => {
    const result = scorePassword('Abcdef12');
    expect(['fair', 'good', 'strong']).toContain(result.strength);
  });

  it('exposes the minimum length constant', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
  });
});
