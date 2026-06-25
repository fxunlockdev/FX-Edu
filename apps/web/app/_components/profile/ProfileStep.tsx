'use client';

import {
  ACCOUNT_SIZE_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  RISK_COMFORT_OPTIONS,
  SOURCE_OPTIONS,
  type TradingProfile,
} from '@/lib/onboarding/profile-fields';
import { OptionGrid } from './OptionGrid';

type ProfileDraft = Partial<Record<keyof TradingProfile, string>>;

interface ProfileStepProps {
  value: ProfileDraft;
  onChange: (key: keyof TradingProfile, value: string) => void;
}

const QUESTIONS: ReadonlyArray<{
  key: keyof TradingProfile;
  title: string;
  options: typeof EXPERIENCE_OPTIONS;
}> = [
  { key: 'experience', title: 'What is your current experience level?', options: EXPERIENCE_OPTIONS },
  { key: 'goal', title: 'What is your main goal?', options: GOAL_OPTIONS },
  { key: 'accountSize', title: 'Approximate account size?', options: ACCOUNT_SIZE_OPTIONS },
  { key: 'riskComfort', title: 'Risk comfort?', options: RISK_COMFORT_OPTIONS },
  { key: 'source', title: 'How did you hear about us?', options: SOURCE_OPTIONS },
];

/**
 * All five trading-profile questions on one screen. Used by checkout's step 4
 * (onboarding uses the wizard variant). Each group is a labelled radiogroup.
 */
export function ProfileStep({ value, onChange }: ProfileStepProps) {
  return (
    <div className="stack gap4">
      {QUESTIONS.map((q) => (
        <fieldset key={q.key} className="profile-step">
          <legend className="profile-step-title" style={{ fontSize: 14 }}>
            {q.title}
          </legend>
          <div style={{ marginTop: 10 }}>
            <OptionGrid
              name={q.title}
              options={q.options}
              value={value[q.key]}
              onChange={(v) => onChange(q.key, v)}
            />
          </div>
        </fieldset>
      ))}
    </div>
  );
}
