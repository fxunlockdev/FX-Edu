import type { CSSProperties } from 'react';

export type LogoVariant = 'dark' | 'light';

interface LogoProps {
  /** 'dark' = ink for light backgrounds, 'light' = ink for dark backgrounds. */
  variant?: LogoVariant;
  /** Height of the mark in px (the wordmark scales from it). */
  size?: number;
  className?: string;
}

/**
 * FX Academy logo — forest-gradient tile with a lime rising-chart mark
 * plus the wordmark. Ported 1:1 from design/assets/shell.js `logo()`.
 */
export function Logo({ variant = 'dark', size = 28, className }: LogoProps) {
  const ink = variant === 'light' ? '#eef3ec' : '#0f3218';
  const tile = size + 6;

  const tileStyle: CSSProperties = {
    display: 'inline-grid',
    placeItems: 'center',
    width: tile,
    height: tile,
    borderRadius: 9,
    background: 'linear-gradient(150deg, #0f3218, #001c07)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08)',
  };

  const wordStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: size * 0.62,
    letterSpacing: '-.02em',
    color: ink,
  };

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
    >
      <span style={tileStyle} aria-hidden="true">
        <svg width={size - 6} height={size - 6} viewBox="0 0 24 24" fill="none">
          <path
            d="M3 19 L8 11 L13 14 L21 4"
            stroke="#c3f35c"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="21" cy="4" r="2.1" fill="#c3f35c" />
          <path d="M3 21 H21" stroke="#c3f35c" strokeWidth="1.4" strokeLinecap="round" opacity=".4" />
        </svg>
      </span>
      <span style={wordStyle}>FX&nbsp;Academy</span>
    </span>
  );
}
