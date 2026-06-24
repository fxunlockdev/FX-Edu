import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** Semantic element to render. Defaults to `div`. */
  as?: ElementType;
  children: ReactNode;
}

/**
 * Centered max-width content rail — the Lumina `.wrap`.
 * Width is `min(maxw, 100% - gutter)` with a tighter gutter on mobile.
 */
export function Container({ as, className, children, ...rest }: ContainerProps) {
  const Tag = as ?? 'div';
  return (
    <Tag className={cn('wrap', className)} {...rest}>
      {children}
    </Tag>
  );
}
