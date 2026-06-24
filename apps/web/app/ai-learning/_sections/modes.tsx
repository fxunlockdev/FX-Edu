import type { ReactNode } from 'react';

/**
 * The four course-aware AI tutor modes (PROJECT.md §6.5, §7.2).
 * Each mode is educational only — none recommends trades, predicts the market,
 * or implies profit. `icon` is the inner SVG path(s) for a 24×24 stroke icon.
 */
export interface TutorMode {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly description: string;
  readonly icon: ReactNode;
}

export const TUTOR_MODES: ReadonlyArray<TutorMode> = [
  {
    id: 'explain',
    label: 'Explain',
    title: 'Explain it simply',
    description:
      'Stuck on a concept? It breaks down liquidity, structure, or risk in plain language, tuned to the tier you are studying right now.',
    icon: <path d="M12 3a7 7 0 0 1 4 12.7c-.7.5-1 .9-1 1.8H9c0-.9-.3-1.3-1-1.8A7 7 0 0 1 12 3ZM9 21h6" />,
  },
  {
    id: 'quiz',
    label: 'Quiz me',
    title: 'Quiz me on this',
    description:
      'Active recall on demand. It quizzes you on what you just learned, checks your reasoning, and flags the gaps worth revisiting.',
    icon: <path d="M9 11a3 3 0 1 1 4 2.8c-.8.4-1 .8-1 1.7M12 18h.01" />,
  },
  {
    id: 'next',
    label: "What's next",
    title: 'What should I study next?',
    description:
      'Not sure where to go? It reads your progress through the curriculum and suggests the single most useful lesson to take now.',
    icon: <path d="M5 12h14M13 6l6 6-6 6" />,
  },
  {
    id: 'review',
    label: 'Review a trade',
    title: 'Review a trade',
    description:
      'Paste a journaled setup and it reviews your process against what you have learned, never whether to buy or sell, only how you thought.',
    icon: <path d="M3 3v18h18M7 14l4-4 3 3 5-6" />,
  },
] as const;
