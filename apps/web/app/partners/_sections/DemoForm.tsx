'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@fxunlock/ui';

interface FormValues {
  name: string;
  email: string;
  organization: string;
  audienceSize: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY: FormValues = {
  name: '',
  email: '',
  organization: '',
  audienceSize: '',
  message: '',
};

const AUDIENCE_OPTIONS = [
  { value: '', label: 'Select range…' },
  { value: '<100', label: 'Under 100 members' },
  { value: '100-500', label: '100 – 500 members' },
  { value: '500-2000', label: '500 – 2,000 members' },
  { value: '2000+', label: '2,000+ members' },
] as const;

// Simple, defensive client-side checks. This is a stub form: it validates and
// shows a confirmation state but never sends data anywhere.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  if (!values.email.trim()) {
    errors.email = 'Please enter your work email.';
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.organization.trim()) errors.organization = 'Please enter your organization.';
  if (!values.audienceSize) errors.audienceSize = 'Please choose an approximate size.';
  return errors;
}

/**
 * Stub "book a demo" form. Client component (interactive leaf). Validates input
 * client-side and renders a confirmation panel; no data is transmitted.
 */
export function DemoForm() {
  const formId = useId();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Clear a field's error as the user corrects it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="wl-form-card">
        <div className="wl-feat-ic" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="h-sm" style={{ margin: '0 0 8px' }}>
          Thanks, {values.name.trim().split(' ')[0] || 'there'} — request received.
        </h3>
        <p className="muted" style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>
          This is a demo form, so nothing was sent. In production our partnerships team would
          follow up at <strong>{values.email.trim()}</strong> to schedule a walkthrough of the
          white-label platform.
        </p>
        <div style={{ marginTop: 18 }}>
          <Button
            type="button"
            variant="glass"
            onClick={() => {
              setValues(EMPTY);
              setErrors({});
              setSubmitted(false);
            }}
          >
            Submit another request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="wl-form-card" onSubmit={handleSubmit} noValidate aria-labelledby={`${formId}-title`}>
      <h3 id={`${formId}-title`} className="h-sm" style={{ margin: '0 0 4px' }}>
        Request a demo
      </h3>
      <p className="muted" style={{ margin: '0 0 4px', fontSize: 14 }}>
        Tell us a little about your academy and we&apos;ll be in touch.
      </p>

      <div className="wl-form-grid">
        <Field
          id={`${formId}-name`}
          label="Full name"
          value={values.name}
          error={errors.name}
          autoComplete="name"
          onChange={(v) => update('name', v)}
        />
        <Field
          id={`${formId}-email`}
          label="Work email"
          type="email"
          value={values.email}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
          onChange={(v) => update('email', v)}
        />

        <div className="wl-form-row">
          <Field
            id={`${formId}-org`}
            label="Organization"
            value={values.organization}
            error={errors.organization}
            autoComplete="organization"
            onChange={(v) => update('organization', v)}
          />
          <SelectField
            id={`${formId}-size`}
            label="Audience size"
            value={values.audienceSize}
            error={errors.audienceSize}
            options={AUDIENCE_OPTIONS}
            onChange={(v) => update('audienceSize', v)}
          />
        </div>

        <div className="field">
          <label htmlFor={`${formId}-msg`}>What are you hoping to build? (optional)</label>
          <textarea
            id={`${formId}-msg`}
            className="input"
            rows={3}
            value={values.message}
            onChange={(e) => update('message', e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <Button type="submit" variant="lime" block>
          Book a demo
        </Button>
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 12, lineHeight: 1.6 }}>
        We use your details only to respond to this enquiry. Educational platform — no trading
        advice or guaranteed outcomes are implied.
      </p>
    </form>
  );
}

/* ---- Field primitives (label-above-input, accessible error wiring) ---- */

interface FieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric';
  onChange: (value: string) => void;
}

function Field({ id, label, value, error, type = 'text', autoComplete, inputMode, onChange }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className={`input${error ? ' wl-input-invalid' : ''}`}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p id={errorId} className="wl-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

function SelectField({ id, label, value, error, options, onChange }: SelectFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className={`input${error ? ' wl-input-invalid' : ''}`}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="wl-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
