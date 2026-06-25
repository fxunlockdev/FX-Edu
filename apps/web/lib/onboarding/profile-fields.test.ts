import { describe, it, expect } from 'vitest';
import { parseTradingProfile } from './profile-fields';

const VALID = {
  experience: 'new',
  goal: 'build_consistency',
  accountSize: '5000',
  riskComfort: 'balanced',
  source: 'youtube',
};

describe('parseTradingProfile', () => {
  it('accepts a complete, valid profile', () => {
    expect(parseTradingProfile(VALID)).toEqual(VALID);
  });

  it('rejects a profile missing any field', () => {
    expect(parseTradingProfile({ ...VALID, source: undefined })).toBeNull();
    expect(parseTradingProfile({ ...VALID, experience: '' })).toBeNull();
  });

  it('rejects unknown option values (untrusted input)', () => {
    expect(parseTradingProfile({ ...VALID, experience: 'hacker' })).toBeNull();
    expect(parseTradingProfile({ ...VALID, accountSize: '999999' })).toBeNull();
    expect(parseTradingProfile({ ...VALID, riskComfort: 'yolo' })).toBeNull();
  });

  it('rejects an empty object', () => {
    expect(parseTradingProfile({})).toBeNull();
  });
});
