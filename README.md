# FX Academy

Education-first forex learning platform — courses, live webinars, course-aware AI tutor, journaling, analytics, community, certificates, affiliates, and white-label academies. **Security-first. EU-only (GDPR). Never a signal room.**

> **Company / operating entity:** FX Unlock · **Product brand:** FX Academy

## Engineering

- Full plan: [`PROJECT.md`](PROJECT.md)
- Product spec (PRD): [`docs/fx-academy-prd.md`](docs/fx-academy-prd.md)
- Design system source: [`design/`](design/) (Lumina)
- Conventions: [`docs/ENGINEERING.md`](docs/ENGINEERING.md)
- Compliance (GDPR): [`docs/compliance/`](docs/compliance/)

## Monorepo layout

```
apps/
  web/        Next.js 15 (marketing + member + admin + affiliate + partner shells)
  api/        NestJS core API (entitlements, webhooks, media tokens, AI gateway, admin)
  workers/    NestJS queue consumers + cron
packages/
  ui/             Lumina design system (React + Tailwind)
  db/             Drizzle schema, RLS policies, migrations
  contracts/      Zod schemas + shared types
  sdk/            typed API client
  entitlements/   pure entitlement decision logic (no I/O)
  config/         eslint / tsconfig / tailwind / env presets
  observability/  OTel + Sentry + redacted logger
infra/        Terraform (AWS bits only) + provider config
```

## Getting started

```bash
corepack enable pnpm   # Node >= 22
pnpm install
pnpm dev
```

## Stack (see PROJECT.md §2)

Next.js + NestJS on **Railway** · **Cloudflare** edge (CDN/WAF/DNS) · Supabase Postgres (RLS, pgvector, Realtime, Storage, **Auth**) · Upstash Redis · Mux video · Stripe · provider-abstracted AI gateway. All personal-data services pinned to **EU (Stockholm)**.
