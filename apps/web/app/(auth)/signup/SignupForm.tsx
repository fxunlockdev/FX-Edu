'use client';

import { useId, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/client';
import { mapAuthError } from '@/lib/auth/errors';
import { scorePassword, MIN_PASSWORD_LENGTH } from '@/lib/auth/password';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  terms?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(name: string, email: string, password: string, terms: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (name.trim().length < 2) {
    errors.name = 'Please enter your name.';
  }
  const trimmedEmail = email.trim();
  if (trimmedEmail.length === 0) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!terms) {
    errors.terms = 'Please accept the Terms to continue.';
  }
  return errors;
}

interface SignupFormProps {
  /** Where to send the user after a successful signup (onboarding). */
  redirectTo: string;
}

/**
 * Signup form (client leaf): name, email, password (with a live strength
 * meter), and a required Terms + risk-acknowledgement checkbox. Handles the
 * "email already registered" case inline with a link to log in.
 *
 * Supabase quirk: when email confirmation is OFF, signing up an existing email
 * returns no error but an `identities` array of length 0 — we treat that as the
 * email-taken case too, so the message is consistent.
 */
export function SignupForm({ redirectTo }: SignupFormProps) {
  const router = useRouter();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const termsId = useId();
  const meterId = useId();

  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);
  const meterWidth = `${(strength.score / 4) * 100}%`;
  const meterColor =
    strength.strength === 'strong' || strength.strength === 'good'
      ? 'var(--pos)'
      : strength.strength === 'fair'
        ? 'var(--warn)'
        : 'var(--neg)';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '');
    const email = String(data.get('email') ?? '');
    const pw = String(data.get('password') ?? '');
    const terms = data.get('terms') === 'on';

    const nextErrors = validate(name, email, pw, terms);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: result, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pw,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const mapped = mapAuthError(error);
        if (mapped.kind === 'email_taken') {
          setErrors({ email: 'taken' });
        } else {
          setFormError(mapped.message);
        }
        return;
      }

      // Existing-email signup with confirmation off → empty identities.
      if (result.user && result.user.identities && result.user.identities.length === 0) {
        setErrors({ email: 'taken' });
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      setFormError(mapAuthError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  const emailErrId = `${emailId}-error`;
  const nameErrId = `${nameId}-error`;
  const passwordErrId = `${passwordId}-error`;
  const termsErrId = `${termsId}-error`;

  return (
    <form className="stack gap3" onSubmit={onSubmit} noValidate>
      {formError && (
        <p className="auth-form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="field">
        <label htmlFor={nameId}>Full name</label>
        <input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          className={errors.name ? 'input auth-input-error' : 'input'}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? nameErrId : undefined}
        />
        {errors.name && (
          <p id={nameErrId} className="auth-field-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

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
        {errors.email === 'taken' ? (
          <p id={emailErrId} className="auth-field-error" role="alert">
            An account with this email already exists. <a href="/login">Log in instead</a>.
          </p>
        ) : (
          errors.email && (
            <p id={emailErrId} className="auth-field-error" role="alert">
              {errors.email}
            </p>
          )
        )}
      </div>

      <div className="field">
        <label htmlFor={passwordId}>Password</label>
        <input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={errors.password ? 'input auth-input-error' : 'input'}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? passwordErrId : meterId}
        />
        <div className="pw-meter" aria-hidden="true">
          <i style={{ width: meterWidth, backgroundColor: meterColor }} />
        </div>
        <div className="pw-meter-row">
          <span
            id={meterId}
            className="pw-meter-label"
            role="status"
            aria-live="polite"
          >
            {strength.strength === 'empty'
              ? `Use at least ${MIN_PASSWORD_LENGTH} characters.`
              : `Password strength: ${strength.label}`}
          </span>
        </div>
        {errors.password && (
          <p id={passwordErrId} className="auth-field-error" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <div>
        <label className="auth-checkbox" htmlFor={termsId}>
          <input
            id={termsId}
            name="terms"
            type="checkbox"
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? termsErrId : undefined}
          />
          <span>
            I agree to the <a href="/terms">Terms</a> and acknowledge that FX Academy provides
            educational content only, not financial advice, and that forex trading involves
            substantial risk.
          </span>
        </label>
        {errors.terms && (
          <p id={termsErrId} className="auth-field-error" role="alert" style={{ marginTop: 4 }}>
            {errors.terms}
          </p>
        )}
      </div>

      <Button type="submit" variant="lime" size="lg" block disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
