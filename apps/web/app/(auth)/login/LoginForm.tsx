'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/client';
import { mapAuthError } from '@/lib/auth/errors';

interface FieldErrors {
  email?: string;
  password?: string;
}

// Pragmatic email shape check — client-side UX only, not authoritative.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(trimmed)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (password.length === 0) {
    errors.password = 'Please enter your password.';
  }
  return errors;
}

interface LoginFormProps {
  /** Where to send the user after a successful login. */
  redirectTo: string;
}

/**
 * Email/password login form (client leaf). Labels sit above inputs, field
 * errors render below with `role="alert"` + `aria-invalid`/`aria-describedby`,
 * and the invalid-credential case shows a single non-leaky banner. Real auth
 * runs through Supabase; the server middleware refreshes the session cookie.
 */
export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const emailErrId = `${emailId}-error`;
  const passwordErrId = `${passwordId}-error`;
  const formErrId = useId();

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '');
    const password = String(data.get('password') ?? '');

    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError(mapAuthError(error).message);
        return;
      }

      // Full navigation so the server re-reads the refreshed session cookie.
      router.replace(redirectTo);
      router.refresh();
    } catch (error: unknown) {
      setFormError(mapAuthError(error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="stack gap3" onSubmit={onSubmit} noValidate>
      {formError && (
        <p id={formErrId} className="auth-form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="field">
        <label htmlFor={emailId}>Email</label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          className={errors.email ? 'input auth-input-error' : 'input'}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? emailErrId : undefined}
        />
        {errors.email && (
          <p id={emailErrId} className="auth-field-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="field">
        <div className="auth-between">
          <label htmlFor={passwordId}>Password</label>
          <a href="/login" className="auth-link-strong">
            Forgot password?
          </a>
        </div>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={errors.password ? 'input auth-input-error' : 'input'}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? passwordErrId : undefined}
        />
        {errors.password && (
          <p id={passwordErrId} className="auth-field-error" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <Button type="submit" variant="lime" size="lg" block disabled={submitting}>
        {submitting ? 'Signing in…' : 'Log in'}
      </Button>
    </form>
  );
}
