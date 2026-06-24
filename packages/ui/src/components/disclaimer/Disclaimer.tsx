import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type DisclaimerKind = 'risk' | 'ai' | 'testimonial' | 'custom';

/**
 * Canonical, policy-approved disclaimer copy (PROJECT.md §5, §6.7, §7.2).
 * No financial-advice or profit-guarantee language anywhere.
 */
export const DISCLAIMER_TEXT = {
  risk:
    'FX Academy provides educational content and tools only. Nothing on this platform is financial advice. Forex trading involves substantial risk and may not be suitable for all traders. Past performance does not guarantee future results.',
  ai:
    'AI responses are educational only and not financial advice. The AI tutor will not recommend trades, predict markets, or guarantee outcomes.',
  testimonial:
    'Member experiences. FX Academy does not imply or guarantee trading profits.',
  custom: '',
} as const satisfies Record<DisclaimerKind, string>;

interface DisclaimerProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Which approved disclaimer to render. */
  kind?: DisclaimerKind;
  /** Override copy — required when `kind="custom"`. */
  children?: ReactNode;
  /** Compact muted footnote styling vs. the bordered callout. */
  variant?: 'note' | 'callout';
}

/**
 * Educational / risk / AI / testimonial disclaimer. Renders semantic, AA-contrast
 * text. The risk and testimonial copy mirror the design package exactly.
 */
export function Disclaimer({
  kind = 'risk',
  variant = 'note',
  children,
  className,
  ...rest
}: DisclaimerProps) {
  const text = kind === 'custom' ? children : DISCLAIMER_TEXT[kind];

  if (variant === 'callout') {
    return (
      <aside
        role="note"
        className={cn('disclaimer-callout', className)}
        {...rest}
      >
        {text}
      </aside>
    );
  }

  return (
    <p role="note" className={cn('disclaimer-note muted', className)} {...rest}>
      {text}
    </p>
  );
}
