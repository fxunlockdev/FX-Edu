# @fxunlock/api

FX Academy **core API** — the single auditable service where every sensitive
decision is made and verified server-side: entitlements, Stripe billing
webhooks, media-token signing, and (later) admin/partner ops and the AI gateway.
NestJS on the **Fastify** adapter, deployed on Railway.

> Server-side authorization always. UI locks are hints. Nothing paid is reachable
> by a client redirect. (PROJECT.md §4, §6.1–6.4)

## Run

```bash
pnpm --filter @fxunlock/api dev        # nest start --watch
pnpm --filter @fxunlock/api build      # nest build
pnpm --filter @fxunlock/api typecheck  # tsc --noEmit
```

Copy `.env.example` → `.env` first. The process **fails fast** on any missing or
malformed env var (validated by `src/config/env.schema.ts`).

> Installs are centralized at the repo root — do **not** run `pnpm install` from
> here (ENGINEERING.md §"Build discipline").

## Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/health` | public | Liveness probe; leaks nothing. |
| `GET` | `/me` | session JWT | Current user + org + role from the verified JWT. |
| `GET` | `/entitlements` | session JWT | Per-feature `allow \| deny \| locked` decisions for the UI. |
| `GET` | `/lessons/:id/playback-token` | session JWT | Entitlement check → short-TTL signed Mux token. 403 if not entitled. |
| `POST` | `/stripe/webhook` | Stripe signature | Raw-body signature verify + idempotency + entitlement mapping. |
| `POST` | `/billing/portal-session` | session JWT | Stripe Customer Portal URL. |

## Architecture

### Request lifecycle

```
helmet (strict CSP/HSTS/nosniff/referrer)
  → nestjs-pino logger (redacts authorization, tokens, emails, PII)
  → JwtAuthGuard      (verify Supabase JWT, attach AuthContext; @Public skips)
  → RolesGuard        (@Roles(...) vs JWT role claim)
  → EntitlementGuard  (@RequireEntitlement(feature), per-route)
  → handler           (Zod-validated inputs)
  → AuditInterceptor  (records every mutating request)
  → AllExceptionsFilter (structured errors, no internal leakage)
```

Two-layer authorization (§6.1): the API policy guards are layer one; **Postgres
RLS** independently enforces row scope via `auth.jwt()` once `@fxunlock/db` is
wired. A bug in one layer is caught by the other.

### The auth → entitlement → media flow (§6.4)

1. The browser authenticates **directly** with Supabase Auth and gets a session
   JWT carrying `sub`, `org_id`, `role`.
2. Every API call sends `Authorization: Bearer <jwt>`. `JwtAuthGuard` verifies it
   via JWKS (jose) and attaches an immutable `AuthContext`.
3. For `GET /lessons/:id/playback-token`, `MediaService` loads the lesson's asset
   + required tier, runs the **pure entitlement decision**, and only on `allow`
   asks the `MediaTokenSigner` to mint a **short-TTL, per-user, per-asset** token.
   Not entitled → `403`, no token ever minted.

### Modules

- `config/` — Zod env schema + typed, frozen `ConfigService` (fail-fast).
- `common/auth/` — `JwtVerifier`, `JwtAuthGuard`, `RolesGuard`, `@Roles`,
  `@Public`, `@CurrentUser`, `AuthContext`.
- `common/validation/` — `GlobalZodValidationPipe` (metadata-driven, app-wide) +
  `ZodValidationPipe` (explicit per-param).
- `common/filters/` — `AllExceptionsFilter`.
- `common/audit/` — `AuditInterceptor` + `AuditService` (interface).
- `common/logging/` — Pino config with redaction.
- `common/security/` — helmet/CSP/HSTS options.
- `modules/auth/` — `GET /me`.
- `modules/entitlements/` — `EntitlementsService`, `EntitlementGuard`,
  `@RequireEntitlement`, `GET /entitlements`; pure decider behind a DI token.
- `modules/billing/` — `POST /stripe/webhook`, `POST /billing/portal-session`.
- `modules/media/` — `GET /lessons/:id/playback-token`.
- `modules/health/` — `GET /health`.

## Stubbed integrations (clean interfaces, ready to wire)

Each is bound behind a DI token / interface so wiring the real implementation is
a one-line provider swap with no change to call sites.

| Concern | Interface / token | Stub | Wire to |
|---|---|---|---|
| Entitlement decision | `EntitlementDecider` / `ENTITLEMENT_DECIDER` | `LocalEntitlementDecider` (pure, encodes §5 plan matrix) | `@fxunlock/entitlements` |
| Subscription snapshot | `EntitlementsService.loadSubscription` | conservative inactive-Basic default | `@fxunlock/db` (`subscriptions`/`entitlements`) + Redis cache |
| Lesson media lookup | `MediaService.resolveLessonMedia` | rejects (no token for unknown asset) | `@fxunlock/db` (`lessons`/`lesson_assets`, RLS-scoped) |
| Media token signing | `MediaTokenSigner` / `MEDIA_TOKEN_SIGNER` | `MuxTokenSigner` (shape-correct placeholder token) | Mux RS256 signed playback (key id + private key) |
| Webhook idempotency | `IdempotencyStore` / `IDEMPOTENCY_STORE` | `InMemoryIdempotencyStore` | Upstash Redis / `idempotency_keys` table |
| Entitlement writes | `EntitlementWriter` / `ENTITLEMENT_WRITER` | `StubEntitlementWriter` (logs only) | `@fxunlock/db` + emit `entitlement.changed` |
| Stripe portal | `BillingService.createPortalSession` | live Stripe call; customer id from client | resolve customer id server-side + step-up auth |
| Audit persistence | `AuditService` / `AUDIT_SERVICE` | `LoggingAuditService` (logs only) | `@fxunlock/db` (`audit_logs`, transactional outbox) |

All stub points are marked in code with `// TODO: wire @fxunlock/<x>`.

## Security notes

- **Secrets** only via validated env — never in source, logs, or responses.
- **Logging** redacts `authorization`, cookies, tokens, emails, card data, and
  Stripe/Mux signatures (`common/logging/logger.config.ts`).
- **Errors** are structured; unexpected errors become an opaque `500` while the
  real cause is logged server-side.
- **Stripe webhook** verifies the signature over the **raw** request body; a
  re-serialized body would not verify.
- **EU-only**: deploy region and all personal-data processors are EU-pinned
  (PROJECT.md §6.8).
