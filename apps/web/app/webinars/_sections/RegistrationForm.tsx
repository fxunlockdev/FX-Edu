'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@fxunlock/ui';

interface FieldErrors {
  name?: string;
  email?: string;
}

type Status = 'idle' | 'success';

// Pragmatic email shape check — client-side UX only, not authoritative.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(name: string, email: string): FieldErrors {
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
  return errors;
}

/**
 * Free webinar registration form — client-side validation only.
 *
 * Submission is intentionally stubbed (no backend wiring): on a valid submit we
 * show an inline confirmation. Labels sit above inputs; error text renders below
 * each field and is wired via `aria-describedby` / `aria-invalid` for AA support.
 */
export function RegistrationForm() {
  const nameId = useId();
  const emailId = useId();
  const nameErrId = `${nameId}-error`;
  const emailErrId = `${emailId}-error`;
  const statusId = useId();

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '');
    const email = String(data.get('email') ?? '');

    const nextErrors = validate(name, email);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus('idle');
      return;
    }

    // Stubbed submit — no backend. Confirm inline and reset the form.
    setStatus('success');
    form.reset();
  }

  return (
    <form className="stack gap2" style={{ textAlign: 'left' }} onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor={nameId}>Name</label>
        <input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          className={errors.name ? 'input wbn-input-error' : 'input'}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? nameErrId : undefined}
        />
        {errors.name && (
          <p id={nameErrId} className="wbn-field-error" role="alert">
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
          className={errors.email ? 'input wbn-input-error' : 'input'}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? emailErrId : undefined}
        />
        {errors.email && (
          <p id={emailErrId} className="wbn-field-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <Button type="submit" variant="lime" size="lg" block>
        Reserve my seat
      </Button>

      <p
        id={statusId}
        className="wbn-form-status"
        role="status"
        aria-live="polite"
        hidden={status !== 'success'}
      >
        You&rsquo;re registered. A calendar invite and reminder are on the way to your email.
      </p>
    </form>
  );
}
