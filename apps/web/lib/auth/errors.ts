/**
 * Maps Supabase Auth errors to user-friendly, non-leaky inline messages
 * (ENGINEERING.md: "user-friendly messages in UI, detailed context
 * server-side"). We never surface raw provider strings or stack traces to the
 * user, and we avoid confirming whether an email exists beyond what the signup
 * flow already reveals.
 */

export type AuthErrorKind = 'invalid_credentials' | 'email_taken' | 'generic';

export interface MappedAuthError {
  readonly kind: AuthErrorKind;
  readonly message: string;
}

const INVALID_CREDENTIALS: MappedAuthError = {
  kind: 'invalid_credentials',
  message: 'That email or password is incorrect. Please try again.',
};

const EMAIL_TAKEN: MappedAuthError = {
  kind: 'email_taken',
  message: 'An account with this email already exists.',
};

const GENERIC: MappedAuthError = {
  kind: 'generic',
  message: 'Something went wrong. Please try again in a moment.',
};

/**
 * Narrows an unknown Supabase error into a safe message. Supabase returns
 * `AuthError` objects with `message` / `status` / `code`; we match on the known
 * shapes and otherwise fall back to a generic message.
 */
export function mapAuthError(error: unknown): MappedAuthError {
  const message = extractMessage(error).toLowerCase();

  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials') ||
    message.includes('invalid email or password')
  ) {
    return INVALID_CREDENTIALS;
  }

  if (
    message.includes('already registered') ||
    message.includes('already been registered') ||
    message.includes('user already exists') ||
    message.includes('email address is already')
  ) {
    return EMAIL_TAKEN;
  }

  // A signup that returns no error but an existing-user identity is handled at
  // the call site; provide a stable fallback for anything else.
  if (message.length > 0 && message.includes('email')) {
    return { kind: 'generic', message: 'We could not complete that request. Please try again.' };
  }

  return GENERIC;
}

function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return '';
}
