'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the user's `prefers-reduced-motion` setting.
 *
 * Starts `true` (motion disabled) so the first client paint matches the
 * server's static, fully-revealed output and updates once the real preference
 * is read — avoiding both hydration mismatch and an unwanted flash of motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(true);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    setReduced(mq.matches);

    const onChange = (event: MediaQueryListEvent): void => setReduced(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
