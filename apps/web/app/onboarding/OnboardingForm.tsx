'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fxunlock/ui';
import { createClient } from '@/lib/supabase/client';
import { saveTradingProfile } from '@/lib/onboarding/save-profile';
import {
  ACCOUNT_SIZE_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  RISK_COMFORT_OPTIONS,
  SOURCE_OPTIONS,
  parseTradingProfile,
  type ProfileOption,
} from '@/lib/onboarding/profile-fields';
import { OptionGrid } from '../_components/profile/OptionGrid';
import { Stepper } from '../_components/profile/Stepper';
import { useResumableOnboarding } from './useResumableOnboarding';

interface StepDef {
  key: 'experience' | 'goal' | 'accountSize' | 'riskComfort' | 'source';
  title: string;
  hint: string;
  options: ReadonlyArray<ProfileOption>;
}

// Non-empty tuple type: STEPS[0] is statically known to exist, which keeps the
// clamped-index access well-typed under noUncheckedIndexedAccess.
const STEPS: readonly [StepDef, ...StepDef[]] = [
  {
    key: 'experience',
    title: 'What is your current experience level?',
    hint: 'We tailor your starting path to where you are today.',
    options: EXPERIENCE_OPTIONS,
  },
  {
    key: 'goal',
    title: 'What is your main goal?',
    hint: 'This shapes the milestones we surface first.',
    options: GOAL_OPTIONS,
  },
  {
    key: 'accountSize',
    title: 'Approximate account size?',
    hint: 'Used only to pre-fill your risk calculator — never shared.',
    options: ACCOUNT_SIZE_OPTIONS,
  },
  {
    key: 'riskComfort',
    title: 'How much risk are you comfortable with?',
    hint: 'A starting default for position sizing — adjustable anytime.',
    options: RISK_COMFORT_OPTIONS,
  },
  {
    key: 'source',
    title: 'How did you hear about us?',
    hint: 'Helps us know what is working.',
    options: SOURCE_OPTIONS,
  },
];

const STEP_LABELS = STEPS.map((s) => labelFor(s.key));

function labelFor(key: StepDef['key']): string {
  switch (key) {
    case 'experience':
      return 'Experience';
    case 'goal':
      return 'Goal';
    case 'accountSize':
      return 'Account';
    case 'riskComfort':
      return 'Risk';
    case 'source':
      return 'Source';
  }
}

interface OnboardingFormProps {
  /** Where to go once the profile is saved. */
  doneHref: string;
  /** Greeting for the user (email), shown at the top. */
  userEmail: string;
}

/**
 * Multi-step, resumable trading-profile form (PROJECT.md §8.2 / §9 module 2).
 * State (current step + answers) persists to localStorage so the flow survives
 * a browser close. On finish it writes to the RLS-scoped `profiles` table via
 * the browser client, then navigates to the dashboard.
 */
export function OnboardingForm({ doneHref, userEmail }: OnboardingFormProps) {
  const router = useRouter();
  const { state, hydrated, setStep, setAnswer, clear } = useResumableOnboarding();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = Math.min(Math.max(state.step, 0), STEPS.length - 1);
  // STEPS is a non-empty constant and stepIndex is clamped into range, so the
  // fallback to the first step is unreachable — it only satisfies the
  // noUncheckedIndexedAccess type guard.
  const current = STEPS[stepIndex] ?? STEPS[0];
  const currentValue = state.answers[current.key];
  const isLast = stepIndex === STEPS.length - 1;

  const progress = useMemo(
    () =>
      STEPS.map((s, i) => ({
        label: STEP_LABELS[i] ?? s.key,
        done: !!state.answers[s.key],
      })),
    [state.answers],
  );

  function back() {
    setError(null);
    if (stepIndex > 0) setStep(stepIndex - 1);
  }

  async function next() {
    setError(null);
    if (!currentValue) {
      setError('Please pick an option to continue.');
      return;
    }
    if (!isLast) {
      setStep(stepIndex + 1);
      return;
    }
    await finish();
  }

  async function finish() {
    const profile = parseTradingProfile(state.answers);
    if (!profile) {
      setError('Please complete every step before finishing.');
      setStep(0);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const result = await saveTradingProfile(supabase, profile);
      if (!result.ok) {
        setError(result.error ?? 'We could not save your profile. Please try again.');
        return;
      }
      clear();
      router.replace(doneHref);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="profile-flow">
      <p className="muted" style={{ marginBottom: 18 }}>
        Welcome, <strong>{userEmail}</strong> — let&rsquo;s personalize your dashboard.
      </p>

      <Stepper steps={progress} activeIndex={stepIndex} />

      <fieldset className="profile-step" aria-busy={!hydrated || submitting}>
        <legend className="profile-step-title">{current.title}</legend>
        <p className="muted profile-step-hint">{current.hint}</p>

        <OptionGrid
          name={current.title}
          options={current.options}
          value={currentValue}
          onChange={(value) => {
            setAnswer(current.key, value);
            setError(null);
          }}
        />
      </fieldset>

      {error && (
        <p className="auth-field-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}

      <div className="profile-actions">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={stepIndex === 0 || submitting}
        >
          Back
        </Button>
        <Button type="button" variant="lime" size="lg" onClick={next} disabled={submitting}>
          {isLast ? (submitting ? 'Saving…' : 'Finish & enter FX Academy') : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
