'use client';

import type { ProfileOption } from '@/lib/onboarding/profile-fields';

interface OptionGridProps {
  /** Group label (rendered by the caller as a legend/heading). */
  name: string;
  options: ReadonlyArray<ProfileOption>;
  value: string | undefined;
  onChange: (value: string) => void;
}

/**
 * Accessible single-select option grid (radiogroup). Used by onboarding +
 * checkout's trading-profile step. Keyboard + screen-reader friendly: the
 * group is a `radiogroup` and each card a `radio` driven by click/Space/Enter.
 * Visual selection uses the Lumina `.opt` / `.opt.sel` classes from the design.
 */
export function OptionGrid({ name, options, value, onChange }: OptionGridProps) {
  return (
    <div className="opt-grid" role="radiogroup" aria-label={name}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? 'opt sel' : 'opt'}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
