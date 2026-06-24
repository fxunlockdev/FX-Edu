# @fxunlock/web

The FX Academy web app — Next.js 15 (App Router) + TypeScript + Tailwind, built on the `@fxunlock/ui` Lumina design system. Deploys to **Railway** as a Next.js `output: 'standalone'` server (no Vercel).

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build (standalone) |
| `pnpm start` | Run the built server |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm e2e` | Playwright E2E (builds + starts, then runs) |

## Structure

```
app/
├── layout.tsx                 # fonts (next/font), metadata, <html lang>
├── globals.css                # Tailwind layers + @fxunlock/ui tokens
├── page.tsx                   # Home page (server component)
└── (marketing)/_sections/     # Hero, TrustBadges, ProductMockup, Problem,
                               # ProductLoop, CurriculumPreview, ToolsSection,
                               # AiSection, WebinarSection, PricingTeaser,
                               # Testimonials, FinalCta, ReferralBanner
lib/
└── referral.ts                # sanitizeRef() + referral cookie constants
middleware.ts                  # captures sanitized ?ref= into a cookie
```

## Notes

- Every page renders `PublicNav` + `Footer`. The risk disclaimer appears in the footer and inline where AI and testimonials are shown.
- `?ref=` is validated + sanitized (`lib/referral.ts`) before being shown or stored — no reflected XSS.
- Fonts: Hanken Grotesk + Manrope via `next/font/google`, exposed as `--font-hanken` / `--font-manrope`.
