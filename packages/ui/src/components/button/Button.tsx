import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'forest' | 'lime' | 'outline' | 'ghost' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  forest: 'btn-forest',
  lime: 'btn-lime',
  // `outline` is an alias of the Lumina ghost (transparent + outline border).
  outline: 'btn-ghost',
  ghost: 'btn-ghost',
  glass: 'btn-glass',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children: ReactNode;
}

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  keyof CommonProps | 'href'
>;
type NativeAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps>;

export type ButtonProps =
  | (CommonProps & NativeButtonProps & { href?: undefined })
  | (CommonProps & NativeAnchorProps & { href: string });

function classes(
  variant: ButtonVariant,
  size: ButtonSize,
  block: boolean,
  className?: string,
): string {
  return cn('btn', VARIANT_CLASS[variant], SIZE_CLASS[size], block && 'btn-block', className);
}

/**
 * Lumina button. Renders an `<a>` when `href` is supplied (so it composes with
 * plain links and Next.js navigation), otherwise a native `<button>`.
 */
export function Button(props: ButtonProps) {
  const {
    variant = 'forest',
    size = 'md',
    block = false,
    className,
    children,
    ...rest
  } = props;

  const cls = classes(variant, size, block, className);

  if (rest.href !== undefined) {
    const anchorProps = rest as NativeAnchorProps & { href: string };
    return (
      <a className={cls} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { href: _href, ...buttonProps } = rest as NativeButtonProps & { href?: undefined };
  return (
    <button className={cls} {...buttonProps}>
      {children}
    </button>
  );
}
