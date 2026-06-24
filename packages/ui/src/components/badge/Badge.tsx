import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone =
  | 'neutral'
  | 'lime'
  | 'lime-dark'
  | 'forest'
  | 'pos'
  | 'warn'
  | 'neg'
  | 'outline';

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: '',
  lime: 'chip-lime',
  'lime-dark': 'chip-lime-d',
  forest: 'chip-forest',
  pos: 'chip-pos',
  warn: 'chip-warn',
  neg: 'chip-neg',
  outline: 'chip-outline',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Render a small leading status dot. `'live'` pulses red. */
  dot?: boolean | 'live';
  children: ReactNode;
}

/** Lumina chip / badge. */
export function Badge({ tone = 'neutral', dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn('chip', TONE_CLASS[tone], className)} {...rest}>
      {dot && <span className={dot === 'live' ? 'dot dot-live' : 'dot'} aria-hidden="true" />}
      {children}
    </span>
  );
}
