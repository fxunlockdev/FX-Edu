# @fxunlock/ui

The **Lumina** design system for FX Academy — design tokens, a Tailwind preset, and React components. Ported 1:1 from `design/assets/lumina.css` and `design/assets/shell.js`.

## What's in here

- `src/styles/tokens.css` — all Lumina `:root` custom properties (light canvas + dark sections) and base element/utility styles. Import once, globally.
- `src/tailwind-preset.ts` — maps the tokens onto the Tailwind theme (colors, `font-display`/`font-body`, `s1..s10` spacing, `r-*` radii, shadows, `ease` timing functions).
- `src/components/*` — `Logo`, `Button`, `Container`, `PublicNav`, `Footer`, `SurfaceCard`, `Badge`, `Disclaimer`.

## Usage

```ts
// tailwind.config.ts
import luminaPreset from '@fxunlock/ui/tailwind-preset';
export default { presets: [luminaPreset], content: [/* ... */] };
```

```css
/* app globals.css — load the tokens + base styles */
@import '@fxunlock/ui/styles/tokens.css';
```

```tsx
import { PublicNav, Footer, Button, Disclaimer } from '@fxunlock/ui';
```

Fonts (Hanken Grotesk + Manrope) are provided by the consuming app via `next/font`, exposed as `--font-hanken` / `--font-manrope`, which the tokens read through `--font-display` / `--font-body`.

## Conventions

- Components are PascalCase, semantic HTML, and use the Lumina utility/kebab classes.
- Immutable props; explicit types on public component APIs.
- `'use client'` only where interaction is required (`PublicNav` burger).
