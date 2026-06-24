# Engineering Conventions

Shared rules every package/app and every contributor (human or agent) follows. Architecture, security, and the data model live in [`../PROJECT.md`](../PROJECT.md); this file is the day-to-day code contract.

## Toolchain
- **Node ≥ 22**, **pnpm 9** (via corepack), **Turborepo**, **TypeScript 5.7 strict**.
- Internal package scope: **`@fxunlock/*`** (company = FX Unlock; product brand = FX Academy).
- Every package: `package.json` (name `@fxunlock/<x>`), `tsconfig.json` extending `../../tsconfig.base.json`, `src/`, a short `README.md`.

## Code style (enforced)
- **Immutability** — never mutate inputs; return new objects.
- **Many small files** — 200–400 lines typical, **800 max**; organize by feature/domain, not by type.
- **Functions < 50 lines**, nesting ≤ 4 levels (early returns).
- **Validate at every boundary with Zod**; never trust external data (API input, webhooks, provider responses, file content).
- **Handle errors explicitly** — no silent catches; user-friendly messages in UI, detailed context server-side.
- **No hardcoded secrets/values** — config via env (validated with a Zod env schema). No secrets in source, bundles, logs, or analytics.

## Security (non-negotiable — see PROJECT.md §6)
- **Server-side authorization always**; UI locks are hints only.
- **Tenant isolation via Postgres RLS** — every tenant-scoped table carries `org_id`; policies read `auth.jwt()` claims.
- **Supabase Auth** issues the session JWT (claims: `sub`, `org_id`, `role`); the API verifies it and RLS reads the same claims natively.
- Short-TTL **signed media tokens** minted only after an entitlement check.
- **Audit every mutation**; idempotency keys on webhooks/payments.
- **EU-only:** all personal-data services pinned to EU (Frankfurt); PII redacted before AI calls.

## Build discipline for parallel work
- Work **only within your assigned package/app directory**. Do **not** edit root config or other packages.
- **Do NOT run `pnpm install`** during package work — installs are centralized to avoid concurrent `node_modules` corruption. Declare dependencies in `package.json`; correctness by construction.
- Reference other internal packages by their `@fxunlock/<x>` name; stub the import with a local type if the package isn't built yet, and leave a `// TODO: wire @fxunlock/<x>` marker.

## Testing
- Unit + integration + critical E2E (Playwright). Target **80%+ coverage** on logic.
- Pure logic (entitlements, risk math, R-multiple) must be deterministic and unit-tested.
- Tenant-isolation tests: cross-`org_id` access must fail.
