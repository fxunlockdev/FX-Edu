import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Apply default `--s3` interior padding (Lumina `.card-pad`). */
  padded?: boolean;
  /** Lift + shadow on hover (Lumina `.card-hover`). */
  hover?: boolean;
  /** Use the dark-section glassmorphic surface instead of the light card. */
  glass?: boolean;
  children: ReactNode;
}

/**
 * Lumina surface — a light `.card` by default, or a `.glass` panel for dark
 * sections. Composes the documented padding/hover modifiers.
 */
export function SurfaceCard({
  padded = true,
  hover = false,
  glass = false,
  className,
  children,
  ...rest
}: SurfaceCardProps) {
  return (
    <div
      className={cn(glass ? 'glass' : 'card', padded && 'card-pad', hover && 'card-hover', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
