import { describe, it, expect } from 'vitest';
import { mapAuthError } from './errors';

describe('mapAuthError', () => {
  it('maps invalid-credential errors', () => {
    const result = mapAuthError(new Error('Invalid login credentials'));
    expect(result.kind).toBe('invalid_credentials');
    expect(result.message).toMatch(/incorrect/i);
  });

  it('maps already-registered errors', () => {
    expect(mapAuthError(new Error('User already registered')).kind).toBe('email_taken');
    expect(mapAuthError({ message: 'Email address is already in use' }).kind).toBe('email_taken');
  });

  it('falls back to a generic, non-leaky message for unknown errors', () => {
    const result = mapAuthError(new Error('connection reset by peer'));
    expect(result.kind).toBe('generic');
    expect(result.message).not.toMatch(/peer/i);
  });

  it('handles non-Error inputs safely', () => {
    expect(mapAuthError(null).kind).toBe('generic');
    expect(mapAuthError(undefined).kind).toBe('generic');
    expect(mapAuthError('Invalid credentials').kind).toBe('invalid_credentials');
  });
});
