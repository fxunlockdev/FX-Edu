import type { AuthContext } from '../../common/auth/auth-context';

/**
 * Authentication methods that count as a fresh second factor for step-up.
 * Supabase records the factor used in the `amr` claim; an `aal2` assurance
 * level is the primary, preferred signal (PROJECT.md §6.1).
 */
const MFA_METHODS: ReadonlySet<string> = new Set([
  'mfa',
  'totp',
  'otp',
  'webauthn',
  'passkey',
]);

/**
 * Has the caller completed an MFA step-up this session?
 *
 * Billing/portal changes require step-up auth (PROJECT.md §6.1, §16). We treat
 * an explicit `aal2` claim as authoritative and fall back to inspecting `amr`
 * for a known MFA method, so a token that carries the factor list but not an
 * `aal` claim still satisfies the check.
 */
export function isSteppedUp(auth: AuthContext): boolean {
  if (auth.aal === 'aal2') {
    return true;
  }
  return (auth.amr ?? []).some((method) => MFA_METHODS.has(method));
}
