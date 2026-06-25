'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Persisted onboarding state so the flow is recoverable after a browser close
 * (PROJECT.md §9 module 2: "onboarding resumes after browser close"). We keep it
 * in `localStorage` keyed per-user-agnostic flow; answers are non-sensitive
 * trading-profile selections, never credentials.
 */
const STORAGE_KEY = 'fx_onboarding_v1';

export interface OnboardingState {
  step: number;
  answers: Record<string, string>;
}

const EMPTY: OnboardingState = { step: 0, answers: {} };

function read(): OnboardingState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    const step = typeof parsed.step === 'number' && parsed.step >= 0 ? parsed.step : 0;
    const answers =
      parsed.answers && typeof parsed.answers === 'object'
        ? (parsed.answers as Record<string, string>)
        : {};
    return { step, answers };
  } catch {
    return EMPTY;
  }
}

/**
 * Resumable onboarding store. Returns the current state plus setters that
 * persist on change. `hydrated` flips true after the first client read so the
 * UI can avoid a hydration mismatch (server renders step 0).
 */
export function useResumableOnboarding() {
  const [state, setState] = useState<OnboardingState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage may be unavailable (private mode); resumability degrades only.
    }
  }, [state, hydrated]);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setAnswer = useCallback((key: string, value: string) => {
    setState((prev) => ({ ...prev, answers: { ...prev.answers, [key]: value } }));
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(EMPTY);
  }, []);

  return { state, hydrated, setStep, setAnswer, clear };
}
