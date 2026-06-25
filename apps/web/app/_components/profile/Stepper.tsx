interface StepperStep {
  label: string;
  done: boolean;
}

interface StepperProps {
  steps: ReadonlyArray<StepperStep>;
  /** Index of the currently active step. */
  activeIndex: number;
}

/**
 * Progress stepper — ported from the design checkout/onboarding flow. Pure
 * presentational; safe in server or client trees. The active and completed
 * steps tint lime; an `ol` keeps the sequence semantic, and `aria-current`
 * marks the active step.
 */
export function Stepper({ steps, activeIndex }: StepperProps) {
  return (
    <ol className="stepper" aria-label="Progress">
      {steps.map((step, i) => {
        const state = i < activeIndex || step.done ? 'done' : i === activeIndex ? 'active' : 'todo';
        return (
          <li
            key={step.label}
            className={`stp ${state === 'todo' ? '' : state}`.trim()}
            aria-current={i === activeIndex ? 'step' : undefined}
          >
            <span className="stp-lbl">
              <span className="stp-n" aria-hidden="true">
                {i < activeIndex || step.done ? '✓' : i + 1}
              </span>
              {step.label}
            </span>
            <span className="stp-ln" aria-hidden="true" />
          </li>
        );
      })}
    </ol>
  );
}
