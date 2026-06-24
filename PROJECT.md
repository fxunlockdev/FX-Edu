# FX Academy — Full Product Engineering Plan (E2E)

> **Owner:** Lead Engineer · **Date:** 2026-06-22 · **Status:** Full-product build plan
> **Source of truth:** [`fx-academy-prd.md`](docs/fx-academy-prd.md) (product) · [`design/`](design/) Lumina design package (UI)
> **One-line:** A security-first, education-first forex learning OS — courses, live webinars, course-aware AI tutor, journaling, analytics, community, certificates, affiliates, and white-label academies. **Never a signal room.**

**How to read this plan.** This is the *complete* product, specified end-to-end — every tier, every surface, full depth. There is **no MVP slice and no "deepen later."** We build the whole thing **one complete module at a time**, in the dependency order given in §11. When a module is built, it ships **feature-complete**, fully secured, and fully tested — then we move to the next. The PRD says *what/why*; this says *how*, *in what build order*, *with what services*, and *under which security and scale guarantees*. Where I diverge from the PRD's recommended stack, I say so and give the scale-out trigger.

---

## Table of Contents

1. [Guiding principles](#1-guiding-principles)
2. [Tech stack decision (and where I diverge from the PRD)](#2-tech-stack-decision)
3. [Services & accounts I need access to](#3-services--accounts-i-need-access-to)
4. [System architecture](#4-system-architecture)
5. [Repository & environment layout](#5-repository--environment-layout)
6. [Cross-cutting security architecture](#6-cross-cutting-security-architecture)
7. [Cross-cutting UX principles](#7-cross-cutting-ux-principles)
8. [Foundation track (build first)](#8-foundation-track)
9. [Product modules (full E2E specs)](#9-product-modules)
10. [Data model & tenancy](#10-data-model--tenancy)
11. [Build sequence (module by module)](#11-build-sequence)
12. [Scale-out paths](#12-scale-out-paths)
13. [Open decisions — resolved](#13-open-decisions--resolved)
14. [Definition of done & quality gates](#14-definition-of-done--quality-gates)

---

## 1. Guiding principles

The non-negotiables every module is held to.

1. **Complete product, sequenced delivery.** We build the entire product as specified — all five curriculum tiers, all roles (member, educator, admin, affiliate, partner), live webinars, AI tutor, analytics, community, certificates, payouts, white-label. We build it **module by module in dependency order**, and each module is **feature-complete** before we move on. No MVP slices.
2. **Server-side authority, always.** UI locks are hints. Every entitlement, media grant, progress write, and certificate is decided and verified server-side. Nothing paid is reachable by a client redirect.
3. **Tenant isolation by default.** Multi-tenancy (white-label) is designed in from row zero — not retrofitted. Postgres **Row-Level Security** enforces it at the database, not just the app layer.
4. **Least privilege.** Services, staff, and tokens get the minimum scope and shortest lifetime that works. Admin/payout/partner actions require step-up auth + audit.
5. **Policy-constrained money & AI claims.** No content, AI answer, tool, testimonial, or trade idea may read as financial advice or a profit guarantee. Enforced in copy, in AI guardrails, and in moderation.
6. **Right-sized platforms, documented scale-out.** The chosen platforms run the *complete* product today — white-label tenancy, 5k-concurrent webinars, AI, Connect payouts. The scale-out paths in §12 are **operational migrations triggered by real load**, never feature unlocks.
7. **Everything auditable, everything idempotent.** Webhooks, payments, payouts, and admin mutations are idempotent and traceable. Events are the spine.

---

## 2. Tech stack decision

The PRD proposes a fully AWS-native estate (ECS Fargate + Aurora Serverless v2 + RDS Proxy + Auth0 + IVS + SQS/EventBridge/Lambda + ElastiCache + AppSync/Ably). My call as lead engineer: **a thin-AWS hybrid that runs the complete product on ~5 platforms, keeps tenant isolation in the database, and has a pre-mapped operational path to the PRD's heavy stack as load grows.** This is *not* a reduced product — it delivers every feature E2E. It's a leaner *operational footprint* for the same product surface.

### The stack

| Layer | Choice | Why this over the alternative |
|---|---|---|
| **Web / edge** | **Next.js 15 (App Router) + TS + Tailwind** on **Railway** (Node standalone) · **Cloudflare** in front (CDN, WAF/bot, edge cache, DNS) | One platform (Railway) runs web + API + workers — simpler ops, single EU region, **no Vercel**. Cloudflare provides the global CDN, WAF, and bot controls; Next.js RSC/ISR still apply. Port the **Lumina** tokens into a Tailwind theme + CSS variables 1:1. |
| **Core API** | **NestJS (TypeScript)** on **Railway** (containers) | All sensitive logic in one auditable service: entitlements, Stripe webhooks, admin APIs, partner ops, AI gateway, media-token signing. Railway = Heroku-grade DX, private networking, autoscaling, cron. Portable to **ECS Fargate** with no rewrite (it's a container). |
| **Background workers** | **NestJS workers on Railway** + **pg-based queue** (Graphile Worker / pgmq) | Transcripts, certificates, notifications, analytics snapshots, AI summaries, affiliate reconciliation. A Postgres queue removes the SQS/EventBridge/Lambda triad until throughput demands it (§12). |
| **Database** | **Supabase Postgres** (managed, RLS, pgvector, Realtime, Storage) | One platform replaces Aurora + RDS Proxy + ElastiCache-for-pubsub + AppSync/Ably + some S3. **RLS gives DB-level tenant isolation** — the PRD's strongest security requirement. It *is* Postgres, so moving to **Aurora** later is replication, not a rewrite. |
| **Cache / rate-limit** | **Upstash Redis** (serverless) | Entitlement cache, dashboard aggregates, market-data cache, IP/user/org rate limits. Pairs cleanly with Railway and the Cloudflare edge. |
| **Identity** | **Supabase Auth** (primary, EU) · **Zitadel** (EU dedicated-IdP path) | Auth lives **inside our EU Postgres** — single processor, no cross-border auth PII, and **native RLS** (`auth.uid()`/`auth.jwt()`), so no third-party JWT bridge. Email/password, Google, Apple, **MFA with AAL step-up**, passkeys/WebAuthn. Orgs/roles modeled in our own `organizations`/`memberships` tables (we own them regardless). Per-partner enterprise **SAML SSO** via the Supabase SSO add-on; if white-label B2B SSO scales, adopt **Zitadel** (EU/Swiss, open-source, org-native) as a dedicated IdP — staying EU-only. |
| **Live + VOD video** | **Mux Video** (primary) · **AWS IVS** (scale path) | Mux collapses IVS + S3-video + MediaConvert + CloudFront-signed into **one managed video API**: low-latency live, signed playback for entitlement, auto-recording → VOD, auto-captions, per-viewer drift. Comfortably exceeds the 5k-concurrent target. Migrate live to **IVS** if concurrent-viewer economics shift (§12). |
| **Object storage** | **Supabase Storage** (app assets) → **S3 + KMS** (if/when AWS-native video) | Chart screenshots, avatars, promo assets, certificate PDFs: RLS + signed URLs, lifecycle rules, upload scan-before-serve. |
| **Payments** | **Stripe** — Checkout, Billing, Customer Portal, Tax, Connect, webhooks | Non-negotiable and PRD-aligned. PCI scope stays entirely with Stripe; we never touch card data. |
| **AI tutor** | **Provider-abstracted AI gateway** in the API + **pgvector** RAG | Retrieval over approved course content only (not open web). Pre/post **moderation**, deterministic financial-advice classifier, PII redaction, prompt-injection defenses, redacted+retention-limited logs. **Default to Claude (swappable)**; embeddings in pgvector. |
| **Market data / news** | **Polygon.io** (FX + crypto) + **Trading Economics** (calendar), behind a provider abstraction | Server-side cache, attribution, kill switch. Labeled "educational context," never execution-grade. |
| **Transactional email** | **Resend** (React Email templates) | Modern DX; in-app notifications in Postgres + Supabase Realtime; PWA push (FCM/APNs) built in. |
| **Observability** | **Sentry** (errors) + **OpenTelemetry → Grafana Cloud** (traces/metrics/logs) + **PostHog** (product analytics, PII-min) + **Checkly/BetterStack** (uptime) | Tracking excludes raw payment data, full AI prompts by default, private journal text, and private messages. |
| **DevEx / build** | **Turborepo + pnpm**, **Drizzle ORM** + SQL migrations, **Zod** contracts, **GitHub Actions** CI | Typed end-to-end; migrations and RLS policies are versioned code. |
| **IaC / secrets** | **Terraform** (only for AWS bits) + provider config-as-code; **Doppler** or 1Password for secrets | Proportional infra: heavy IaC only where AWS is actually used. |

### What this buys us

- **The complete product on ~3 core platforms** (Railway — web + API + workers — Supabase, which also provides EU-resident auth, and Stripe) **+ Mux** for video and **Cloudflare** at the edge — far less ops surface than a 12-service AWS estate, while the **security posture is *stronger*** because tenant isolation (and now identity) is enforced in the database via RLS.
- **No rewrites on the path to scale.** NestJS → ECS, Supabase Postgres → Aurora, pg-queue → SQS, Mux → IVS, Supabase Auth → Zitadel are all swaps behind stable interfaces, each with a named trigger (§12). We never rebuild a feature to scale it.

---

## 3. Services & accounts I need access to

Provisioned in **build order** (§11) — you don't pay for a video provider before its module is built, but the full product needs every service below. For each, the **access to provision** is what I need handed to me (or an admin seat to self-provision).

### Core platform — provision before the foundation track

| # | Service | Purpose | Tier | Access I need |
|---|---|---|---|---|
| 1 | **GitHub** (org) | Monorepo, CI/CD, Actions, secret scanning, Dependabot | Team | Org owner/admin on a `fx-academy` org |
| 2 | **Cloudflare** | DNS + global CDN + WAF/bot + edge cache (in front of Railway web) | Pro | Account + DNS zone admin |
| 3 | **Railway** | **Web (Next.js) + API + workers + cron** (+ pg-queue) | Pro | Workspace admin; project create |
| 4 | **Supabase** | Postgres, RLS, pgvector, Realtime, Storage | Pro (Team for SOC2) | Org owner; create project per env |
| 5 | **Supabase Auth** (part of #4) | EU-resident identity: login, MFA (AAL step-up), passkeys, Google/Apple, RBAC claims | included | covered by Supabase access |
| 6 | **Stripe** | Subscriptions, Tax, Customer Portal, **Connect**, webhooks | Standard + Connect + Tax | Account admin; restricted API keys; Connect enabled |
| 7 | **Upstash** | Serverless Redis (cache, rate-limit) | Pay-as-you-go | Account; DB create |
| 8 | **Resend** | Transactional email | Pro | Account; verified sending domain (DNS access) |
| 9 | **Sentry** | Error monitoring (web + API) | Team | Org admin; 2 projects |
| 10 | **Doppler** (or 1Password) | Secrets management across envs | Team | Workspace admin |
| 11 | **Domain registrar** | New apex domain for `app.`/`api.`/email/partner domains (DNS managed in Cloudflare, #2) | — | registrar access (new domain — TBD) |
| 12 | **Snyk** (or GitHub Advanced Security) | Dependency + container scanning | Team | Org seat |

### Feature services — provision when their module comes up in the sequence

| # | Service | Purpose | Needed for module | Access I need |
|---|---|---|---|---|
| 13 | **Mux** | Live webinars + VOD lessons, signed playback, recording, captions | Lesson Player, Live Webinars | Account admin; signing keys |
| 14 | **AI provider** (Anthropic default; OpenAI optional) | AI tutor model + moderation; embeddings | AI Tutor, Analytics insights | Org admin; API keys; usage limits |
| 15 | **Polygon.io** | FX/crypto prices, snapshots, history | Trade Ideas / Prices | Account; API key; WebSocket entitlement |
| 16 | **Trading Economics** | Economic calendar / macro events | Market News | Licensed API key + attribution terms |
| 17 | **PostHog** | Product analytics (EU residency option) | Cross-cutting (early) | Project admin |
| 18 | **Grafana Cloud** (or Datadog) | OTel traces/metrics/logs, dashboards, alerts | Cross-cutting (early) | Org admin |
| 19 | **Checkly / BetterStack** | Synthetic uptime + status page | Cross-cutting | Account |
| 20 | **Cloudmersive / ClamAV host** | Malware scan on uploads | Any upload (Journal, Community) | API key or worker host |
| 21 | **AWS account** | S3+KMS storage; IVS/MediaConvert if the video scale path is exercised | Media storage; scale-out | Management account; least-priv IAM; separate dev/stage/prod accounts |
| 22 | **Zitadel** (EU/Swiss, optional) | Dedicated EU IdP for enterprise white-label SSO/SAML — keeps identity in-EU | White-Label (enterprise tier) | Cloud EU account or self-host |
| 23 | **LiveKit Cloud / Amazon Chime SDK** | Two-way small-group video for Elite coaching | Elite Cohort | Account admin |

> **Legal/compliance to line up in parallel (blocking for public launch):** Terms, Privacy, **Risk Disclosure**, **AI Disclosure**, **Affiliate Disclosure**, cookie consent, signed **DPAs (with SCCs / EU–US Data Privacy Framework)** with every processor (Supabase, Stripe, Mux, AI provider, Resend, PostHog, Sentry, Upstash), a public **sub-processor list**, a **RoPA**, an appointed **privacy contact/DPO**, and 18+/jurisdictional age-gate copy. **GDPR is a hard requirement — see §6.8** (EU-region pinning + data-subject-rights tooling: export, cross-processor erasure, retention/purge, 72-hour breach runbook).

---

## 4. System architecture

```
                          ┌────────────────────────────────────────────┐
                          │                 Clients                     │
                          │  Browser (Next.js)  ·  PWA  ·  (native later)│
                          └───────────────┬────────────────────────────┘
                                          │ HTTPS (TLS), Supabase Auth session JWT
                ┌─────────────────────────┼──────────────────────────────┐
                │                          │                              │
        ┌───────▼────────┐       ┌─────────▼─────────┐          ┌─────────▼─────────┐
        │ Railway (web)  │       │  Supabase Auth    │          │  Stripe (billing) │
        │ Next.js App    │       │ login/MFA/passkey │          │ Checkout/Portal/  │
        │ RSC + actions  │       │ EU · in our DB    │          │ Connect/Tax       │
        └───────┬────────┘       └─────────┬─────────┘          └─────────┬─────────┘
                │ server-only calls         │ JWT w/ org_id,role           │ webhooks (idempotent)
        ┌───────▼───────────────────────────▼──────────────────────────────▼────────┐
        │                      Core API — NestJS on Railway                          │
        │  Authz middleware · Entitlement service · Stripe/webhook handlers ·        │
        │  Media token signer · AI gateway (RAG+moderation) · Admin/Partner APIs ·   │
        │  Market-data proxy · Affiliate attribution · Audit logger                  │
        └───┬───────────────┬──────────────┬───────────────┬───────────────┬─────────┘
            │               │              │               │               │
   ┌────────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐ ┌──────▼───────┐
   │ Supabase PG   │ │ Upstash     │ │ Mux Video  │ │ Supabase    │ │ pg-queue →   │
   │ RLS + pgvector│ │ Redis cache │ │ live + VOD │ │ Storage     │ │ Workers      │
   │ Realtime      │ │ rate-limit  │ │ signed url │ │ signed url  │ │ (Railway)    │
   └───────────────┘ └─────────────┘ └────────────┘ └─────────────┘ └──────┬───────┘
                       Workers: transcripts, certificates, notifications,   │
                       analytics snapshots, AI summaries, email (Resend),   │
                       affiliate reconciliation, malware scan.              │
```

**Key rule:** the browser **authenticates** directly with Supabase Auth (receiving a session JWT) but **never reads privileged data directly**. All privileged data flows through the NestJS API (or Next.js server actions that call the API) — the single place entitlement decisions are made and audited. The only direct client↔service links are: Supabase Auth (auth SDK), Stripe Checkout/Portal (hosted), and Mux *playback* via short-lived **signed tokens the API mints after an entitlement check**.

---

## 5. Repository & environment layout

**Monorepo** (Turborepo + pnpm):

```
fx-academy/
├── apps/
│   ├── web/            # Next.js (marketing + member + admin + affiliate + partner shells)
│   ├── api/            # NestJS core API
│   └── workers/        # NestJS queue consumers + cron
├── packages/
│   ├── ui/             # Lumina design system → React + Tailwind (ported from design/)
│   ├── db/             # Drizzle schema, RLS policies, migrations, seed
│   ├── contracts/      # Zod schemas + OpenAPI; shared request/response types
│   ├── sdk/            # typed API client (generated from contracts)
│   ├── entitlements/   # pure entitlement decision logic (unit-tested, no I/O)
│   ├── config/         # eslint, tsconfig, tailwind preset, env schema (zod)
│   └── observability/  # OTel + Sentry init, logger with redaction
├── infra/              # Terraform (AWS bits only), provider config-as-code
└── docs/               # PRD, ADRs, runbooks, this plan
```

**Environments:** `dev` (local + Supabase branch) → `preview` (per-PR Railway env + Supabase branch) → `staging` (prod-like, DAST target) → `prod`. Separate Stripe (test/live), Mux (env keys), and Supabase projects (including Auth) per environment. **No shared secrets across envs.**

**Design port (foundation track):** `packages/ui` translates [`design/assets/lumina.css`](design/assets/lumina.css) tokens into a Tailwind theme + CSS custom properties verbatim (forest `#0f3218`, lime `#c3f35c`, Hanken Grotesk / Manrope, 8px rhythm, the documented radii/shadows/easing), and rebuilds [`shell.js`](design/assets/shell.js)'s public nav, footer, and the four role sidebars (member/affiliate/admin/partner) as composable React components with the proper proOnly lock logic. Every later screen is then a thin composition over a real design system.

---

## 6. Cross-cutting security architecture

The security backbone every module inherits. Target: **OWASP ASVS L2** for the member app, **L3 patterns** for admin/billing/payout/partner flows.

### 6.1 AuthN / AuthZ
- **Supabase Auth** issues short-lived session JWTs; a custom-claims hook stamps `sub` (user), `org_id` (active tenant), and `role`. The API verifies the JWT on every request and derives effective permissions; **RLS reads the same claims natively** via `auth.jwt()` — no third-party bridge.
- **Two-layer authorization:** (1) an API **policy guard** checks role + entitlement before the handler runs; (2) **Postgres RLS** independently enforces row scope via `auth.jwt()->>'org_id'` and role claims. A bug in one layer is caught by the other.
- **MFA enforced** for admin, educator, affiliate-payout, and partner-admin roles. **Step-up auth** (fresh MFA) for: billing changes, payout account changes, password/email change, partner domain change, admin impersonation.
- **Session policy:** short TTL + frequent refresh for admin; longer refresh for members with risk-based re-auth (new device/geo → re-challenge).

### 6.2 Entitlement enforcement (the heart of the product)
- A dedicated **`entitlements` package** holds pure decision logic: `{plan, subscription_status, org/tenant, course_tier, webinar_access, media_token_state}` → `allow | deny | locked`. Fully unit-tested, no I/O.
- **Source of truth is Stripe webhooks**, written into `subscriptions` + `entitlements` idempotently. A nightly **reconciliation job** re-pulls Stripe to heal missed events.
- Entitlement results cached in Redis (short TTL), **invalidated on `entitlement.changed`**. Every gated API + every media-token mint re-checks (cache is an optimization, not the authority).
- **Downgrades preserve data** (journal, certificates, progress) but flip gated views to locked. No destructive deletes on downgrade.

### 6.3 Tenant isolation
- Every tenant-scoped table carries `org_id`. **RLS policies** restrict all reads/writes to the caller's `org_id`. Global FX Academy data lives under a system org; partner admins can *never* read it.
- An automated test asserts isolation: for each tenant-scoped table, a cross-tenant read/write must fail. Runs in CI, blocks merge.

### 6.4 Media security
- Private buckets / private Mux playback only. **No public object listing.**
- Playback uses **short-TTL signed tokens** minted by the API *after* an entitlement check — never a static URL. Per-user, per-asset, expiring.
- **Dynamic per-session watermark** (member ID/email hash) at the player for Pro/Elite video. Abuse monitor flags excessive concurrent streams per account → throttle/alert.

### 6.5 AI safety
- Retrieval restricted to **approved course content in pgvector** (no open web for core tutoring). Lesson transcripts and user uploads are untrusted input with **prompt-injection defenses** (content fencing, instruction stripping).
- **PII redaction before model calls**; minimal user context (current lesson, tier, plan, progress) — never billing/payout/address.
- **Pre- and post-generation moderation** + a deterministic **financial-advice classifier** that blocks buy/sell/entry/exit/guarantee/signal/leverage-recommendation outputs. Flagged conversations → **human review queue** (admin).
- Logs redacted and **retention-limited**; users can delete their AI history.

### 6.6 Application hardening
- **Strict CSP** (nonce-based scripts), `frame-ancestors`, **HSTS** (preload), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, locked-down `Permissions-Policy`.
- **CSRF protection** for cookie-authenticated endpoints; **Zod validation at every boundary**; **idempotency keys** on webhooks + payment ops.
- **Rate limits** by IP, user, org, endpoint, and risk score (Upstash). **Cloudflare WAF** for credential stuffing, bots, suspicious checkout.
- **Uploads:** signed URLs with MIME/type/size validation + **malware scan before the asset is ever served** (asset stays `pending` until scan passes).
- **CI security gates:** secret scanning (Gitleaks/TruffleHog), SAST (Semgrep/CodeQL), dependency scanning (Snyk/Dependabot), **DAST (ZAP) against staging**. Any CRITICAL blocks merge.

### 6.7 Data & compliance
- **Encryption at rest** (Supabase/KMS) and **in transit** everywhere. Secrets only in Doppler + provider stores — never in source, bundles, logs, or analytics.
- **GDPR/CCPA** export + delete workflows (member-initiated in Settings, admin-assisted in Console).
- **Age gate** (18+/jurisdictional) at signup. **Risk/AI/affiliate disclaimers** on every relevant surface, enforced as publish-time acknowledgements for educator content.
- **Every admin mutation writes an audit log** (`actor, action, target, metadata, IP, UA, ts`); dangerous actions require a reason note + step-up.
- Backups encrypted and **restore-tested quarterly**.

### 6.8 GDPR & data protection (EU) — hard requirement
GDPR is a first-class constraint, not an afterthought. It is satisfied through **EU-region pinning + processor governance + data-subject-rights tooling** — *not* by changing the database engine.

- **Database decision under GDPR:** **stay on Supabase, pinned to an EU region (project is `eu-north-1`, Stockholm).** Supabase is GDPR-capable (EU hosting, signed DPA, SOC 2 Type II). Self-managing Aurora/RDS yields **no compliance gain** at our scale — only cost and ops. AWS Postgres becomes the trigger *only* if an enterprise customer or regulator mandates in-account single-tenancy / VPC isolation (§12).
- **EU region pinning for every service that holds or processes personal data** (table below). US-based processors are covered by a **DPA + EU–US Data Privacy Framework / Standard Contractual Clauses**; no EU personal data is processed without one.
- **Lawful basis & consent:** a cookie-consent gate blocks all non-essential cookies/analytics until granted; consent is granular, withdrawable, and recorded. Marketing email = explicit opt-in; transactional email under contract basis.
- **Data-subject rights — built, not bolted on:**
  - *Access + portability:* one-click export of all personal data (profile, journal, progress, AI conversations, community, certificates) as JSON/CSV, orchestrated across every processor.
  - *Erasure ("right to be forgotten"):* a worker **fans out deletion** to Supabase (data + Auth), Mux, Resend, PostHog, and AI logs. Legally required records (Stripe invoices, tax) are retained under legal-obligation basis; the **audit-log actor is pseudonymized, not deleted**, so the trail survives without holding PII.
  - *Rectification, restriction, objection:* self-serve in Settings.
- **Data minimization & pseudonymization:** minimal AI context + PII redaction before model calls (§6.5); analytics IDs hashed; video watermark uses an email *hash*, not the raw email; no PII in logs or analytics.
- **Retention & purge:** enforced TTLs with automated purge jobs — AI logs, notifications, market-data cache, soft-deleted content, and inactive accounts.
- **Breach response:** Sentry/Grafana alerting → **72-hour notification runbook** + breach register.
- **Governance artifacts:** Records of Processing Activities (RoPA), a public **sub-processor list**, signed **DPAs** with every processor, an internal **privacy contact/DPO**, an **EU Representative (Art. 27 — required because the operating entity is outside the EU; must be EU-located)**, and a `privacy@` inbox. Tracked in [`docs/compliance/`](docs/compliance/) (roles register + sub-processor list scaffolded; RoPA + DPA tracker to follow).

**Per-service GDPR posture (all personal-data services in EU):**

| Service | Holds personal data | GDPR configuration |
|---|---|---|
| **Supabase** (DB + Storage) | Yes — core | EU region (**Stockholm `eu-north-1`**); DPA; SOC 2; RLS scoping; erasure via SQL + storage purge |
| **Supabase Auth** (identity) | Yes — email/name | Auth PII lives **inside our EU Postgres** — single processor, no cross-border transfer; MFA + passkeys; erased with the user record |
| **Stripe** (billing) | Yes — billing PII | DPA + DPF; invoices retained under legal obligation; never store card data |
| **Mux** (video) | Limited — IP / view data | DPA; EU storage; signed playback only |
| **Resend** (email) | Yes — email | DPA; consent/opt-out; suppression list |
| **PostHog** (analytics) | Yes — behavioral | **EU Cloud**; consent-gated; IP anonymized; PII-minimized |
| **Sentry** (errors) | Possibly — in traces | **EU region**; server-side PII scrubbing |
| **Upstash** (Redis cache) | Transient | EU region; short TTL; no durable PII |
| **AI provider** (Anthropic/OpenAI) | Yes — conversation | DPA; **zero-retention** API tier; PII redacted pre-call; **EU inference** via provider EU endpoint or **Amazon Bedrock EU (Frankfurt)** |
| **Railway** (web + API + workers) | In transit | EU region deploys |
| **Cloudflare** (DNS / CDN / WAF) | IP address | DPA; EU/global edge |
| **Polygon / Trading Economics** | No personal data | N/A |

---

## 7. Cross-cutting UX principles

UX is a top priority. These apply to every screen.

1. **Education-first, calm, disciplined.** The Lumina system (light canvas, dark dashboards, forest+lime, glassmorphic depth) is preserved exactly. The visual language signals *operating system*, not signal room.
2. **Trust is rendered, not claimed.** Risk disclaimers, "educational only" labels, and source citations are first-class UI. Every AI answer, trade idea, and tool shows its disclaimer inline.
3. **Locked ≠ broken.** For Basic users, Pro features render as *designed locked states with a clear upgrade path and a preview of value* — never an error or blank. Locks leak no protected content.
4. **Recoverable flows.** Onboarding, checkout, and lesson progress survive a browser close. Optimistic UI on journal/community with rollback + visible error on failure.
5. **Graceful degradation.** Live prices/news degrade to a calm "temporarily unavailable" state if a provider is down — the dashboard never hard-fails on a third party.
6. **Performance is UX.** Public LCP < 2.5s (mobile p75), authenticated route transitions < 500ms cached, journal save < 500ms p95, AI first token < 2s simple / < 5s retrieval-heavy. Compositor-friendly motion only.
7. **Accessible by default.** Semantic HTML, keyboard nav, visible focus (the Lumina `:focus-visible` lime ring), reduced-motion honored, WCAG AA contrast.
8. **Honest empty/first-run states.** New-user dashboard is a guided checklist, not a wall of zeros.

---

## 8. Foundation track

These ship **first**, in parallel where possible. Every product module depends on them. Each is delivered complete.

### F1 — Design system port
Translate Lumina tokens + `shell.js` shells into `packages/ui` (Tailwind theme + React components: public nav, footer, member/affiliate/admin/partner sidebars with lock logic, top bar with ⌘K palette). **Done:** every surface composes from `packages/ui`; visual parity with the design package.

### F2 — Identity & Access
Supabase Auth (login, signup, MFA with AAL step-up, passkeys/WebAuthn, Google/Apple/email-pw) ↔ `users`/`profiles`/`organizations`/`memberships`. Custom-claims hook stamps `org_id`/`role` on the JWT; **RLS reads them natively** via `auth.jwt()` (no third-party bridge). Risk-based re-auth. **Done:** secure login/signup; roles + org context in JWT + RLS; admin MFA enforced.

### F3 — Data layer, RLS & audit
Drizzle schema for the full [data model](#10-data-model--tenancy); RLS policies on every tenant-scoped table; cross-tenant isolation test in CI; `audit_logs`; transactional outbox + pg-queue topics emitting the PRD's [Key Events](docs/fx-academy-prd.md). **Done:** schema migrated; isolation tests pass; an event round-trips to a worker.

### F4 — Entitlements & Billing core
Stripe products/prices (Basic $49/$39yr, Pro $97/$78yr, Elite from $147 waitlist); idempotent webhook handler; `plans`/`subscriptions`/`entitlements`; pure `entitlements` package; reconciliation cron. **Done:** a test subscription drives entitlements; replayed webhooks are no-ops; reconciliation heals a dropped event.

### F5 — Media token & storage service
Mux signing keys; Supabase Storage buckets with RLS; signed upload URLs + scan-before-serve; `GET /lessons/:id/playback-token`. **Done:** tokens mintable only for entitled users; unscanned uploads never served.

### F6 — CI/CD & security baseline
GitHub Actions: typecheck, lint, unit/integration/E2E (Playwright), SAST, secret scan, dep scan, DAST-on-staging; preview envs; Terraform plan/apply for AWS bits; observability (OTel + Sentry + structured redacted logging). **Done:** full gate set runs on every PR; a planted secret/critical vuln blocks merge.

### F7 — Admin shell + content authoring
Admin shell (ADMIN nav) with **MFA + audit**; Members (search/view/suspend/GDPR), Courses/Lessons authoring (CRUD, media upload, captions/transcripts/notes, publish). This exists early because content must be authored before the learning experience can be populated. (Remaining admin sections are specified in M19 and built alongside their feature modules.) **Done:** admin can author a full course tier and manage members; every mutation audited.

---

## 9. Product modules

Each module is a **complete, E2E spec** using the template: **Goal · Screens · Logic/Data · Key APIs · 🔒 Security · ✨ UX · 📈 Scale · Done when.** The number is its position in the build sequence (§11).

---

### 1 · Public Marketing Site
- **Goal:** Convert visitors via an education-first funnel; rank well; preserve referral + plan intent.
- **Screens:** `home`, `curriculum`, `pricing`, `webinars-landing`, `trading-tools`, `ai-learning-landing`, `affiliate-landing`, `whitelabel-landing`.
- **Logic/Data:** Static/ISR pages; `?ref=` capture → cookie; selected-plan persistence to checkout. Six-step product loop, five-tier curriculum preview, testimonials with disclaimers.
- **🔒** Referral code validated + sanitized before display (no reflected XSS); disclaimers on every page; testimonials carry no profit guarantee.
- **✨** Sticky glass nav, dark hero sections, product mockup with dashboard + AI prompt, referral banner when `?ref=` present.
- **📈** Cloudflare CDN + Next.js ISR (on Railway); near-zero origin load.
- **Done when:** all public pages carry the risk disclaimer; CTAs preserve referral + plan; Lighthouse perf/a11y/SEO budgets pass.

### 2 · Auth, Signup, Checkout, Onboarding
- **Goal:** A trustworthy, recoverable purchase + profiling flow; access only after verified webhook.
- **Screens:** `login`, `signup`, `checkout` (4 steps: account → plan → payment → trading profile), `checkout-success`.
- **Logic/Data:** Supabase Auth signup → `users`/`profiles`; Stripe Checkout (hosted/embedded, **no raw card data**); coupon states (valid/expired/invalid); 3DS/SCA; post-payment trading profile (experience, goal, account size, risk comfort, source); recoverable onboarding state; Elite waitlist capture.
- **Key APIs:** `POST /checkout/session`, `POST /stripe/webhook`, `POST /onboarding`.
- **🔒** Subscription active only after verified webhook; no paid access on client redirect; declined/3DS/failed handled; coupon validation server-side.
- **✨** Success screen offers next actions (start Entry, set account size, watch walkthrough, join webinar); onboarding resumes after browser close.
- **Done when:** purchase Basic/Pro end-to-end; failed/declined/3DS handled; access strictly webhook-gated; onboarding recoverable.

### 3 · Learning Paths & Lesson Player (full 5 tiers)
- **Goal:** The complete learn loop across **all five tiers** — browse, gate by entitlement, watch, resume, quiz, complete, earn certificate progress.
- **Screens:** `curriculum` (public), `learn`, `lesson`.
- **Logic/Data:** `courses`/`modules`/`lessons`/`lesson_assets`/`progress`/`quizzes`/`quiz_attempts`. **All tiers: Entry, Beginner, Intermediate, Advanced, Psychology.** Search + filters (difficulty, duration, certificate availability) + tabs (All/My Courses/each tier/Completed). Course cards (level, lessons/modules, duration, plan access, progress, lock). Lesson player: adaptive HLS (Mux), resume-from-position, speed/captions/fullscreen, transcript/notes/quiz tabs, bookmark, download notes, mark-complete, completion modal (XP, quiz CTA, journal CTA, next). Upgrade modal for Basic→Pro courses.
- **Key APIs:** `GET /courses`, `GET /courses/:id`, `GET /lessons/:id/playback-token`, `POST /lessons/:id/progress`, `POST /lessons/:id/complete`, `POST /quiz-attempts`.
- **🔒** Course unlocks entitlement-checked server-side; completion requires server-verified watch %/quiz; certificate progress not client-forgeable; signed playback per §6.4.
- **✨** Resume exactly where left; progress advances only on server ack; designed locked states for gated tiers.
- **📈** Mux handles VOD scale; progress writes batched (≥ every 15s + on pause/exit).
- **Done when:** all five tiers fully navigable + gated; progress persisted ≥15s + pause/exit; completion rules enforced; progress not forgeable.

### 4 · Trading Tools & Risk Calculator
- **Goal:** Deterministic, instrument-aware risk math that funnels to membership and into the journal — **all seven tools**.
- **Screens:** `trading-tools` (public), `risk-calculator`, live preview in `trade-new`.
- **Logic/Data:** Position Size, R:R Planner, Pip Value, P&L Simulator, Correlation Checker, Session Clock, **Prop Firm Risk mode**. Inputs (account size/currency, risk %/amount, pair, direction, entry/SL/TP) → outputs (lot size, risk amount, stop distance, reward, R:R, pip value, warnings). Save to journal as draft/new trade.
- **🔒** Pure deterministic functions, **unit-tested**; warnings before save on >2%/tight-stop/prop-cap; slippage/spread/execution disclaimer in copy.
- **✨** Public version free but drives membership CTA; live sizing preview while logging.
- **Done when:** all tools deterministic + unit-tested + instrument-aware; risk warnings shown pre-save.

### 5 · Trade Journal & Logging
- **Goal:** Fast, private trade logging with server-computed stats and export/delete rights.
- **Screens:** `journal`, `trade-new`.
- **Logic/Data:** `trades`/`trade_attachments`. Summary (trades/week, win rate, avg R:R, net R 30d, best pair, avg emotion); recent-trades table; filters (pair/result/session/setup/date); log form (pair, direction, setup, session, entry/SL/TP, result, emotion 1–10, thesis, "what differently", chart uploads, draft/complete); live sizing preview; AI reflection card (Pro).
- **Key APIs:** `GET /journal/trades`, `POST /journal/trades`.
- **🔒** R-multiple + win/loss **recomputed server-side**; attachments scanned; private user data (RLS); CSV export + deletion request.
- **✨** Optimistic save with rollback; journal stays accessible after downgrade (Pro analytics locked).
- **Done when:** stats server-computed; downgrade preserves journal; export + deletion work.

### 6 · Performance Analytics
- **Goal:** Turn journal data into behavioral insight (Pro), never trade calls.
- **Screens:** `analytics`.
- **Logic/Data:** `analytics_snapshots`. Summary (win rate, avg/net R, avg risk, trades analyzed, consistency grade); charts (net R over time, win rate by session/day, avg R by setup, R by pair); AI insights (best session, loss clusters, best setup, behavioral leaks); date range.
- **🔒** Pro-only; excludes open trades unless selected; **AI insights never recommend live trades**.
- **✨** Charts as part of the design system; update after trade save.
- **📈** Snapshots computed by workers; read replicas at the analytics trigger (§12).
- **Done when:** open trades excluded by default; charts update on save; insights non-advisory.

### 7 · AI Tutor
- **Goal:** Course-aware, safety-bounded tutoring that explains, quizzes, and reflects — never advises trades.
- **Screens:** `ai-learning-landing` (public), `ai-tutor`, lesson-scoped AI panel.
- **Logic/Data:** `ai_conversations`/`ai_messages`. Modes: Explain / Quiz me / What's next / Review a trade. RAG over course content in pgvector; minimal user context; lesson-scoped panel; citations to lesson snippets. Admin-managed knowledge base.
- **Key APIs:** `POST /ai/conversations`, `POST /ai/conversations/:id/messages`.
- **🔒** Pro-only; refuses buy/sell/entry/exit/guarantee/signal; grounded in retrieved content; PII-redacted; moderation pre/post; prompt-injection defenses; redacted retention-limited logs; user can delete history; flags → admin review.
- **✨** Inline "educational only, not financial advice" disclaimer; suggested prompts; streaming first token < 2s.
- **📈** Retrieval cached; rate-limited; 100 req/min sustained + burst.
- **Done when:** no direct trade recommendations possible; answers grounded; logs redacted; history deletable.

### 8 · Live Webinars & Replays
- **Goal:** Entitlement-gated live sessions at scale, auto-recorded into a searchable replay library.
- **Screens:** `webinars-landing` (public), `webinars` (member), dashboard webinar card.
- **Logic/Data:** `webinars`/`webinar_registrations`/`webinar_recordings`. Mux live (private playback for Pro/Elite); auto-record → VOD; transcript + AI summary worker; educator session creation (title, host, topic, time/tz, access level, cap, recording, chat/Q&A); reminders (confirm/24h/1h/30m); moderated chat (slow mode, blocked terms, report, mute/ban, pin); public free webinar registration (name + email).
- **Key APIs:** `POST /webinars/:id/register`, `GET /webinars/:id/join-token`, `GET /replays`.
- **🔒** Pro-only stream not joinable by Basic/expired (token-gated); chat moderation audited; recording auto-attached; failure → admin alert + retry.
- **✨** Countdown to next live; reserve seat + add to calendar; replays with transcript/summary/topic filter.
- **📈** **5,000 concurrent target, headroom to 25,000** via Mux (→ IVS scale path if economics shift). Reminders via queue.
- **Done when:** gated stream enforced; recording auto-published; processing failure alerts + retries; moderation audited.

### 9 · Certificates
- **Goal:** Verifiable, server-minted certificates that recognize *education*, not results.
- **Screens:** `certificates`.
- **Logic/Data:** `certificates`. Earned/in-progress/locked states; earned cert (name, tier, course, issue date, verification ID, public verify URL, PDF, share). PDF generated by worker → Supabase Storage.
- **🔒** **Cannot be minted from client completion events alone**; verify URL reveals only validity + minimal identity.
- **✨** Clean shareable PDF + public verification page on-brand.
- **Done when:** server-minted only; verify URL minimal-disclosure.

### 10 · Strategy Library
- **Goal:** Educational playbooks that can feed certificate/course progress.
- **Screens:** `strategies`.
- **Logic/Data:** `strategies`. Six playbooks (Breakout Retest, Liquidity Sweep Reversal, Trend Pullback, Range Rotation, Session Open Drive, FVG Fill); filters (All/Technical/Smart Money/Trend/Range); cards (category, difficulty, lessons, lock); playbook content (concept, rules, setup, invalidation, risk notes, examples, related lessons, quiz/checklist).
- **🔒** Educational language only; Basic sees locked Pro strategies.
- **Done when:** playbooks educational-only; completion can contribute to certificate progress when configured.

### 11 · Trade Ideas, Market News, Live Prices
- **Goal:** Educator "ideas" framed as examples, plus cached market context — never signals.
- **Screens:** `trade-ideas`; dashboard news + prices cards.
- **Logic/Data:** `trade_ideas`/`market_quotes`/`news_items`. Educator ideas (educator, ts, instrument, bias, timeframe, analysis, educational entry area, invalidation, objective, tag, related lesson, chart); filters; save/discuss/open-strategy. Prices (EUR/USD, GBP/USD, USD/JPY, XAU/USD, BTC/USD, AUD/USD) via Polygon; news + impact via Trading Economics. Server-side cache + kill switch.
- **🔒** Pro-only (unless teaser configured); **disclosure ack required before publish**; no signal-like push copy; provider data cached + attributed; "educational examples" disclaimer mandatory.
- **✨** Sparklines + % change; graceful degradation if provider down.
- **📈** Provider responses cached (Redis); kill switch on license/limit breach.
- **Done when:** publish requires disclosure ack; no signal-like notifications; data cached + attributed.

### 12 · Community & Pods
- **Goal:** Accountable, well-moderated discussion that bans signal-selling by design.
- **Screens:** `community`.
- **Logic/Data:** `community_channels`/`community_posts`/`community_comments`/`reactions`/`reports`/`pods`/`pod_members`. Channels (General, TA, Fundamentals, Psychology, Journaling, Wins & Lessons, Prop Prep); composer (text + chart upload); posts (author, channel, ts, body, reactions, replies, save); online list; rules; accountability pods (6–10, weekly goals/check-ins, unread, admin assignment + self-join); moderation (report, admin queue, mute/ban, auto-hold solicitation). Realtime via Supabase.
- **Key APIs:** `GET /community/channels`, `POST /community/posts`, `POST /community/reports`.
- **🔒** Pro-only; Basic can't read via direct URL (RLS + entitlement); all moderation logged; **soft-delete for audit**; auto-hold recommendation-framed calls.
- **✨** Realtime presence/unread; optimistic posting with rollback.
- **📈** Supabase Realtime for presence/unread; 500 concurrent target.
- **Done when:** Basic blocked via direct URL; moderation logged; deletes are soft.

### 13 · Prop Firm Prep
- **Goal:** A disciplined readiness path integrated with risk calc + journal — no pass guarantees.
- **Screens:** `prop-firm`.
- **Logic/Data:** Readiness score; prep path (rulebook → routine → simulate → funded); evaluation-day checklist; user-configurable constraints (max daily/overall drawdown, profit target, per-trade cap, eval dates); integrates risk calculator + journal.
- **🔒** Pro-only; **never claims to guarantee passing**; rules user-configured, not official firm data unless licensed.
- **Done when:** no guarantee claims; constraints user-configurable and clearly unofficial; integrated with calc + journal.

### 14 · Affiliate Portal
- **Goal:** Tamper-resistant referral attribution and compliant Stripe Connect payouts.
- **Screens:** `affiliate-landing` (public) + portal (Overview, Referral Link, Commissions, Payouts, Promo Assets, Settings).
- **Logic/Data:** `affiliates`/`referrals`/`commissions`/`payouts`. Onboarding (application, affiliate-disclosure accept, Stripe Connect); referral link (code, UTM builder, QR/share); overview (clicks, signups, trials, paid, MRR referred, projected payout); commissions (Basic 20%/Pro 30% recurring, 60-day cookie, last-touch, refund/chargeback adjustments); payouts (Connect status, pending/available/paid, KYC); promo assets (banners, swipe copy, webinar links, social graphics).
- **🔒** **Attribution server-side + tamper-resistant**; self-referral blocked unless allowed; payouts blocked until KYC + disclosure complete; payout changes need step-up + MFA.
- **✨** Clear funnel metrics; one-click promo assets + share links.
- **📈** Attribution events idempotent; commission accrual via workers.
- **Done when:** attribution tamper-resistant; self-refer blocked; payouts KYC/disclosure-gated.

### 15 · Lifecycle Messaging
- **Goal:** Reliable transactional + lifecycle email and in-app notifications, preference-aware.
- **Logic/Data:** Resend templates (React Email) for webinar reminders, new trade idea, community reply, weekly digest, product update, certificate earned, failed payment, affiliate payout, partner domain verification. Fan-out via pg-queue → workers. PWA push (FCM/APNs).
- **🔒** Preference-respecting (no email to opted-out users); no signal-like copy; unsubscribe + compliance.
- **Done when:** each event type delivers per the user's channel prefs; digests batch correctly.

### 16 · Billing (self-service)
- **Goal:** Members manage their plan with Stripe; we mirror state only after webhook.
- **Screens:** `billing`.
- **Logic/Data:** Current plan, price, interval, renewal; switch-to-yearly; Customer Portal; billing history + receipts; payment-method summary; cancel (retain access to period end); failed-payment state; upgrade/downgrade.
- **Key APIs:** `POST /billing/portal-session`.
- **🔒** Step-up for billing changes; changes reflected only after webhook; no card data stored.
- **✨** Cancel keeps access until period end (unless immediate); clear failed-payment recovery.
- **Done when:** changes webhook-gated; cancel retains access correctly; card managed by Stripe only.

### 17 · Settings & Notifications
- **Goal:** Profile, preferences, full security controls, and a notification inbox.
- **Screens:** `settings`, `notifications`.
- **Logic/Data:** `notifications`/`notification_preferences`. Profile (photo, names, email, country, bio); notification toggles (webinar reminders, trade ideas, community replies, weekly digest, product updates); learning prefs (risk profile, default session); security (password, MFA/passkeys, active sessions, connected accounts, delete/export). Notification tabs (All/Webinars/Community/Progress), unread, mark-all-read, read-on-click.
- **🔒** Email change requires verification + **step-up**; account deletion starts compliant workflow; active-session revocation.
- **✨** Preferences honored across email/in-app/push; calm, legible inbox.
- **Done when:** prefs honored per channel; email change gated; deletion workflow compliant.

### 18 · Member Dashboard
- **Goal:** Personalized home aggregating every module — reflects real progress, plan, profile, activity.
- **Screens:** `dashboard` (new-user / Basic / Pro states).
- **Logic/Data:** Plan badge, streak, XP, greeting, primary CTA; new-user checklist; continue-learning; today's focus; live-prices + news cards (degrade gracefully); upcoming webinar; journal + risk snapshots; AI prompts; community + performance cards; locked Pro cards for Basic. *(Built after its data sources exist; the shell can be stubbed earlier and cards wired as modules land.)*
- **Key APIs:** `GET /dashboard` (aggregated).
- **🔒** Locked cards leak no protected content; all data server-personalized.
- **✨** First-run = guided checklist, not zeros; locked cards show value + upgrade CTA.
- **📈** Dashboard aggregate cached in Redis (short TTL) → p95 < 800ms.
- **Done when:** content personalized from actual data; locked cards safe; price widget degrades gracefully.

### 19 · Admin Console (full)
- **Goal:** The complete operational backbone (F7 delivered the shell + content authoring; this completes every remaining section).
- **Screens:** Admin nav: Overview, Members, Courses, Lessons, Webinars, Trade Ideas, AI Knowledge, Community Mod, Affiliates, Revenue, White-label, CRM/Integrations, Settings.
- **Logic/Data:** Overview KPIs (members, MRR, churn, active learners, attendance, AI usage, reports, failed payments); Members (search, view, **impersonate with audit + limited scope**, suspend/ban, GDPR export/delete); Courses/Lessons (CRUD, media, captions/transcripts, publish); Webinars (schedule, secure stream keys, registrations, moderate, process replay); Trade Ideas (CRUD + disclosure ack); AI Knowledge (snippets, re-index, flagged convos, guardrail config); Community Mod (reports queue, actions, banned phrases, discipline history); Affiliates (applications, codes, rates, fraud, payout status); Revenue (subs, invoices, refunds, failed payments, coupons); White-label (partners, domains, branding, licensing); CRM/Integrations (webhooks, lists, exports); Settings (roles, permissions, audit logs, feature flags, disclosures).
- **Key APIs:** `GET /admin/audit-logs` + per-surface admin APIs.
- **🔒** **MFA required**; every mutation audited; dangerous actions need step-up + reason; impersonation scoped + logged; partner admins never see global data.
- **✨** Fast search; clear destructive-action confirmations; audit visible.
- **📈** Admin reads hit replicas at the analytics trigger; KPI aggregates cached.
- **Done when:** MFA enforced; every mutation audited; dangerous actions step-up + reason; all sections operational.

### 20 · White-Label Partner Portal
- **Goal:** A partner launches a branded, isolated academy with custom domain and reporting.
- **Screens:** `whitelabel-landing` (public) + portal (Partner Overview, Branding, Domain, Course Library, Members, Revenue/Licensing, Team Access, Settings).
- **Logic/Data:** `organizations` (branding/domain config) + `memberships`. Onboarding (org → branding/domain → library/team → launch checklist); branding (logo, favicon, colors, theme, legal copy); domain (custom domain, DNS, ownership verify, SSL); course library (FX curriculum + partner content, hide/show tiers); members (invite/import, engagement, roles); revenue/licensing (seats, members, fees, revenue share, invoices); team roles (owner/admin/educator/support).
- **🔒** **Tenant data isolated in every query (RLS)**; partner admins can't reach global admin; **custom domains require verified ownership before routing**; enterprise SSO → Supabase SAML add-on, escalating to a **dedicated EU IdP (Zitadel)** for heavy B2B SSO.
- **📈** Aurora + AWS-account isolation become attractive for enterprise partners (§12).
- **Done when:** isolated members/theme/domain/reporting; ownership-verified domains; no cross-tenant leakage.

### 21 · Elite Cohort & Coaching
- **Goal:** High-touch tier — coaching calls, educator Q&A, early access, smaller cohorts.
- **Logic/Data:** Elite plan + entitlements; monthly coaching (two-way small-group video via **LiveKit Cloud** or **Amazon Chime SDK**); educator Q&A; early-access content flags.
- **🔒** Elite-gated; same media/AI guardrails.
- **Done when:** Elite users get coaching/Q&A/early access gated correctly.

---

## 10. Data model & tenancy

The PRD's [data model](docs/fx-academy-prd.md) is adopted as-is. Engineering additions:

- **Every tenant-scoped table carries `org_id`** with an RLS policy; global content lives under a system org.
- **Soft-delete** (`deleted_at`) on community + moderated content for audit retention.
- **Drizzle ORM** owns the schema; RLS policies and migrations are versioned SQL in `packages/db`. Generated TS types keep the SDK in sync.
- **pgvector** table(s) for AI retrieval (course chunks, glossary, policy text, approved examples) with per-row source metadata for citations.
- **Idempotency keys** table for webhooks/payments. **Event outbox** table feeding the queue (transactional outbox) so events are never lost on commit.

---

## 11. Build sequence

We build the **complete product, module by module, in dependency order.** Foundations first; then each product module is built to its full E2E spec (§9) before the next begins.

**Foundation track (parallel where possible):**
`F1 Design system` · `F2 Identity & Access` · `F3 Data + RLS + audit` · `F4 Entitlements & Billing core` · `F5 Media token & storage` · `F6 CI/CD + security` · `F7 Admin shell + content authoring`

**Product modules (recommended order — each built complete):**

| # | Module | Hard dependencies |
|---|---|---|
| 1 | Public Marketing Site | F1 |
| 2 | Auth · Signup · Checkout · Onboarding | F2, F4 |
| 3 | Learning Paths & Lesson Player (5 tiers) | F1, F4, F5, F7 (content) |
| 4 | Trading Tools & Risk Calculator | F1 |
| 5 | Trade Journal & Logging | F3, F5; pairs with #4 |
| 6 | Performance Analytics | #5 (journal data) |
| 7 | AI Tutor | F5, #3 (course content for RAG) |
| 8 | Live Webinars & Replays | F5 (Mux) |
| 9 | Certificates | #3 (tier completion) |
| 10 | Strategy Library | #3 |
| 11 | Trade Ideas, News, Prices | market-data services |
| 12 | Community & Pods | F3 (Realtime), uploads |
| 13 | Prop Firm Prep | #4, #5 |
| 14 | Affiliate Portal | F4 (Connect) |
| 15 | Lifecycle Messaging | F3 (events), Resend |
| 16 | Billing (self-service) | F4 |
| 17 | Settings & Notifications | F2, #15 |
| 18 | Member Dashboard | aggregates #3–#13 |
| 19 | Admin Console (full) | the modules it manages |
| 20 | White-Label Partner Portal | F2 (orgs), F3 (RLS), most modules |
| 21 | Elite Cohort & Coaching | #8, LiveKit/Chime |

> Order is a recommendation; #16/#17 can move earlier if you want paying members self-serving sooner. The dependency column is the binding constraint, not the numbering.

---

## 12. Scale-out paths

The platforms below run the **complete** product as specified. As real-world load grows, each component has a pre-decided **operational** migration triggered by a metric — never a rewrite, never a feature unlock.

| Component | Current | Scale to | **Trigger** |
|---|---|---|---|
| Job queue | pg-queue (Graphile/pgmq) | **AWS SQS + EventBridge + Lambda** | Sustained backlog or fan-out the DB queue can't keep clean; cross-service event bus needed |
| Database | Supabase Postgres | **Aurora Serverless v2 + RDS Proxy + read replicas** | Analytics read load needs replicas; AWS-account isolation / BAA; approaching Supabase tier ceiling |
| Live video | Mux | **AWS IVS** (private channels, signed playback, S3 recording) | Concurrent-viewer economics favor self-managed |
| API runtime | Railway (NestJS container) | **AWS ECS Fargate + ALB** | Need VPC isolation, PrivateLink, enterprise compliance, finer autoscaling |
| Realtime/pubsub | Supabase Realtime | **AppSync / Ably** | Community concurrency or fan-out outgrows Supabase Realtime |
| Identity | Supabase Auth | **Zitadel (EU/Swiss) dedicated IdP** (or Supabase SAML add-on) | Enterprise white-label partner needs per-org SAML SSO |
| Cache | Upstash Redis | **ElastiCache Serverless** | Co-locating with an AWS-native estate for latency/cost |

**Standing practices from day one:** Redis caching of dashboard/entitlements/provider data; aggregate reads pre-computed by workers; cursor pagination on all lists; transactional outbox for events; partition/archive event-heavy tables (`audit_logs`, `notifications`, `market_quotes`) as they grow. The reference load (50k users, 10k paid, 5k concurrent webinar, 100 AI req/min) sits inside the current stack.

---

## 13. Open decisions — resolved

The PRD's §14 decisions, with my engineering call:

1. **Primary region** → **Locked to EU for GDPR (EU-only).** All personal-data services in the EU (Supabase project is **`eu-north-1`, Stockholm**; Railway compute, Upstash, Sentry EU, PostHog EU Cloud in EU; AI inference via EU endpoint / Bedrock EU); Cloudflare/Mux serve globally. Auth PII never leaves our EU database. (See §6.8.)
2. **Auth & tenancy** → **Supabase Auth** (EU, in our DB) for all users; **orgs/roles modeled in our own schema** with RLS. Per-partner enterprise **SAML SSO** via the Supabase SSO add-on, escalating to a **dedicated EU IdP (Zitadel)** if white-label B2B SSO scales (built with module #20). Clerk/Auth0 dropped to keep identity EU-only.
3. **Market data contract** → **Polygon + Trading Economics** behind a provider abstraction; finalize license + attribution before module #11.
4. **Community: custom vs managed** → **Custom Postgres + Supabase Realtime** (full control, RLS isolation, no extra vendor).
5. **AI vector store** → **Private pgvector only** for curriculum retrieval (no third-party hosted vector store) — tighter data control, simpler compliance.
6. **Mobile** → **PWA first** (installable, web/FCM push), native later only if retention demands.

**Additional engineering decisions:** Supabase over Aurora (RLS isolation + migration path); **Supabase Auth over Clerk/Auth0** (EU-only identity, auth PII in our DB, native RLS); Mux over IVS (one video API for the full product); Railway over ECS; pg-queue over SQS; Drizzle ORM; Turborepo monorepo; provider-abstracted AI gateway defaulting to Claude (EU inference via Bedrock EU).

---

## 14. Definition of done & quality gates

A module is **done** only when:

- [ ] Its full PRD acceptance criteria pass (verified, not assumed) — **complete feature set, no deferred slices.**
- [ ] **Entitlement + RLS tenant-isolation tests** pass (cross-tenant access denied).
- [ ] Server-side authorization verified; no client-only gating.
- [ ] **80%+ test coverage** across unit + integration + critical E2E (Playwright) for its flows.
- [ ] Security gates green: SAST, secret scan, dependency scan, DAST-on-staging — zero CRITICAL/HIGH.
- [ ] Performance budgets met (LCP/route/API/save targets in §7).
- [ ] Accessibility: keyboard nav, focus states, reduced-motion, AA contrast.
- [ ] Required disclaimers rendered (risk / AI / affiliate where applicable).
- [ ] Audit logging present for every mutation; observability (traces/errors) wired.
- [ ] Runbook + rollback documented for anything stateful or money/identity-touching.

---

### Immediate next steps (to start the foundation track)
1. Confirm the **core platform** accounts (§3) and hand me admin/owner access.
2. Confirm **go-to-market region** (drives data residency + region choices).
3. I'll scaffold the monorepo, port the Lumina design system into `packages/ui`, and stand up the full **foundation track** (F1–F7) in `dev` — secure auth, RLS, entitlements, media tokens, admin authoring, CI security gates.
4. Then we build the product modules **one complete module at a time** in the §11 order.
5. In parallel, kick off the **legal/compliance** artifacts (§3 note) since they gate public launch.

> Pointers: product spec → [`docs/fx-academy-prd.md`](docs/fx-academy-prd.md); design package → [`design/`](design/). This plan supersedes the PRD only on stack/build-order where explicitly noted; all product requirements and acceptance criteria remain authoritative — and in scope.
