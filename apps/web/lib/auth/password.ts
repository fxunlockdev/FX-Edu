/**
 * Password-strength scoring for the signup meter. Pure + deterministic so it is
 * trivially unit-testable. This is a UX affordance only — the authoritative
 * minimum-length / complexity policy is enforced by Supabase Auth on signup.
 */

export type PasswordStrength = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordScore {
  /** 0–4 bucket score driving the meter width + label. */
  readonly score: 0 | 1 | 2 | 3 | 4;
  readonly strength: PasswordStrength;
  /** Human label shown beside the meter. */
  readonly label: string;
}

/** Minimum length we ask for in the UI (mirrors Supabase default). */
export const MIN_PASSWORD_LENGTH = 8;

const LABELS: Record<PasswordStrength, string> = {
  empty: '',
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

/**
 * Buckets a password into a 0–4 strength score from length + character variety.
 * Not a security control — see file header.
 */
export function scorePassword(password: string): PasswordScore {
  if (password.length === 0) {
    return { score: 0, strength: 'empty', label: LABELS.empty };
  }

  let points = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) points += 1;
  if (password.length >= 12) points += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  if (/\d/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password)) points += 1;

  // Short passwords can never read above "weak".
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { score: 1, strength: 'weak', label: LABELS.weak };
  }

  const strength: PasswordStrength =
    points >= 5 ? 'strong' : points >= 4 ? 'good' : points >= 3 ? 'fair' : 'weak';
  const score = (strength === 'strong' ? 4 : strength === 'good' ? 3 : strength === 'fair' ? 2 : 1) as
    | 1
    | 2
    | 3
    | 4;

  return { score, strength, label: LABELS[strength] };
}
