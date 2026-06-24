import type { Config } from 'tailwindcss';

/**
 * Lumina design tokens mapped into a Tailwind preset.
 *
 * Every value references the CSS custom properties defined in
 * `src/styles/tokens.css`, so the Tailwind utilities and the raw Lumina
 * classes stay in lockstep — change a token once, both update.
 *
 * Apps consume this via `presets: [luminaPreset]` in their tailwind.config.
 */
const luminaPreset = {
  theme: {
    extend: {
      colors: {
        // Surfaces (light canvas)
        surface: {
          DEFAULT: 'var(--surface)',
          dim: 'var(--surface-dim)',
          bright: 'var(--surface-bright)',
        },
        c: {
          lowest: 'var(--c-lowest)',
          low: 'var(--c-low)',
          DEFAULT: 'var(--c)',
          high: 'var(--c-high)',
          highest: 'var(--c-highest)',
        },
        // Ink
        ink: {
          DEFAULT: 'var(--on-surface)',
          var: 'var(--on-surface-var)',
        },
        outline: {
          DEFAULT: 'var(--outline)',
          var: 'var(--outline-var)',
        },
        // Brand greens
        forest: {
          DEFAULT: 'var(--primary)',
          deep: 'var(--primary-deep)',
          tint: 'var(--primary-tint)',
          on: 'var(--on-primary)',
          container: 'var(--primary-container)',
          'on-container': 'var(--on-primary-container)',
        },
        // Lime accent
        lime: {
          DEFAULT: 'var(--lime)',
          dim: 'var(--lime-dim)',
          bright: 'var(--lime-bright)',
          ink: 'var(--lime-ink)',
          on: 'var(--on-lime)',
        },
        // Tertiary leaf
        leaf: {
          DEFAULT: 'var(--leaf)',
          deep: 'var(--leaf-deep)',
        },
        // Functional
        pos: { DEFAULT: 'var(--pos)', 'on-dark': 'var(--pos-on-dark)' },
        warn: { DEFAULT: 'var(--warn)', 'on-dark': 'var(--warn-on-dark)' },
        neg: { DEFAULT: 'var(--neg)', 'on-dark': 'var(--neg-on-dark)' },
        'error-container': 'var(--error-container)',
        'on-error-container': 'var(--on-error-container)',
        // Dark-section tokens
        d: {
          bg: 'var(--d-bg)',
          'bg-2': 'var(--d-bg-2)',
          surface: 'var(--d-surface)',
          'surface-2': 'var(--d-surface-2)',
          ink: 'var(--d-ink)',
          'ink-var': 'var(--d-ink-var)',
        },
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
      spacing: {
        s1: 'var(--s1)',
        s2: 'var(--s2)',
        s3: 'var(--s3)',
        s4: 'var(--s4)',
        s5: 'var(--s5)',
        s6: 'var(--s6)',
        s8: 'var(--s8)',
        s10: 'var(--s10)',
      },
      maxWidth: {
        wrap: 'var(--maxw)',
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        DEFAULT: 'var(--r)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
        '2xl': 'var(--r-2xl)',
        full: 'var(--r-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lg: 'var(--shadow-lg)',
        dark: 'var(--shadow-dark)',
      },
      transitionTimingFunction: {
        lumina: 'var(--ease)',
        'lumina-out': 'var(--ease-out)',
        'lumina-in-out': 'var(--ease-in-out)',
      },
    },
  },
} satisfies Partial<Config>;

export default luminaPreset;
