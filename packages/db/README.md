# @fxunlock/db

Data layer for **FX Academy** (FX Unlock). Drizzle ORM schema, Row-Level
Security policies, validation contracts, and the runtime client — targeting
**Supabase Postgres 17** pinned to **EU (`eu-north-1`, Stockholm)**.

This package owns the full data model from `PROJECT.md` §10 and the PRD §9.
Schema, RLS policies, and migrations are **versioned code**; generated TS types
keep the SDK in sync.

---

## Schema module map

The model is split by domain into small files (<400 lines each) under
`src/schema/`, re-exported from `src/schema/index.ts`:

| File | Tables |
|---|---|
| `_shared.ts` | column helpers (`id`/`created_at`/`updated_at`, soft-delete), the pgvector `vector` type |
| `enums.ts` | all shared Postgres enums |
| `auth.ts` | `users`, `profiles`, `organizations`, `memberships` |
| `billing.ts` | `plans`, `subscriptions`, `entitlements` |
| `learning.ts` | `courses`, `modules`, `lessons`, `lesson_assets`, `progress`, `quizzes`, `quiz_attempts`, `certificates` |
| `webinars.ts` | `webinars`, `webinar_registrations`, `webinar_recordings` |
| `ai.ts` | `ai_conversations`, `ai_messages`, `course_chunks` (pgvector) |
| `journal.ts` | `trades`, `trade_attachments`, `analytics_snapshots` |
| `strategies.ts` | `strategies`, `trade_ideas`, `market_quotes`, `news_items` |
| `community.ts` | `community_channels`, `community_posts`, `community_comments`, `reactions`, `reports`, `pods`, `pod_members` |
| `engagement.ts` | `notifications`, `notification_preferences` |
| `affiliates.ts` | `affiliates`, `referrals`, `commissions`, `payouts` |
| `ops.ts` | `audit_logs`, `feature_flags`, `idempotency_keys`, `event_outbox` |

**Conventions (enforced):**

- Every table: `id uuid default gen_random_uuid()`, `created_at`, `updated_at`.
- Every **tenant-scoped** table carries `org_id uuid` → `organizations(id)`.
- **Soft-delete** (`deleted_at`) only on community + moderated content
  (`community_posts`, `community_comments`) for audit retention.
- Money is stored in **minor units (cents)** as integers; trade prices use
  `numeric` for precision.
- **Global** (non-tenant) tables — `plans`, `market_quotes`, `news_items`,
  `feature_flags`, `idempotency_keys`, `event_outbox` — have **no** `org_id`.

### Validation contracts

`drizzle-zod` insert/select schemas are co-located per domain
(`insertXSchema` / `selectXSchema`). These are the **validation contracts** —
import them at every system boundary (API input, webhook payloads, worker jobs)
to validate before touching the database (ENGINEERING.md: "Validate at every
boundary with Zod").

---

## RLS / tenancy approach

Tenant isolation is enforced **at the database** via Postgres Row-Level
Security — not only in the app layer (PROJECT.md §6.3). Two independent layers
guard every request: (1) the NestJS API **policy guard** checks role +
entitlement before the handler runs, and (2) **RLS** independently enforces row
scope. A bug in one layer is caught by the other.

### Two connection roles, one policy expression

The canonical tenant predicate on every tenant-scoped table is:

```sql
org_id = app.current_org()
```

`app.current_org()` (defined in `src/policies/00_helpers.sql`) resolves the
effective org from **either** source, so a single policy works for both paths:

1. **NestJS API path (primary).** The API connects as an *authenticated*
   (non-superuser) role and, per request, opens a transaction and sets
   transaction-local GUCs before any query:

   ```sql
   select set_config('app.current_org',  $org,  true);
   select set_config('app.current_role', $role, true);
   select set_config('app.current_user', $user, true);
   ```

   RLS reads them via `current_setting('app.current_org', true)`. The helper
   `withTenant(db, ctx, work)` in `src/client.ts` wraps this for you. Using
   `set_config(..., true)` (transaction-local) means the setting **never leaks
   across pooled connections**.

2. **Supabase-native path.** Edge / Realtime clients authenticate with the user
   JWT; RLS reads the claim natively:

   ```sql
   org_id = (auth.jwt() ->> 'org_id')::uuid
   ```

   The custom-claims hook stamps `sub`, `org_id`, and `role` onto the JWT
   (PROJECT.md §6.1). `app.current_org()` falls back to
   `current_setting('request.jwt.claims', true)::jsonb ->> 'org_id'`, so the
   same policy expression covers it with no third-party bridge.

### What is protected

- **Every tenant-scoped table** gets `enable` + `force row level security` and a
  policy scoped to `app.current_org()` (`src/policies/01_rls_tenant.sql`).
  `FORCE` ensures the policy applies even to the table owner.
- **User-owned** tables (`progress`, `trades`, `ai_conversations`,
  `notifications`, …) are additionally constrained to the caller's own rows;
  org admins/owners may read across users *within their org*.
- **Soft-deleted** community rows are hidden from non-admins but retained for
  admins (audit).
- **Global tables** (`src/policies/02_rls_global.sql`): `plans` /
  `market_quotes` / `news_items` allow authenticated **read**; `feature_flags` /
  `idempotency_keys` / `event_outbox` are **service-role only** (RLS forced with
  no permissive policy — the Supabase `service_role` / table owner bypasses RLS
  for privileged API + worker paths).
- The **system org** holds global FX Academy curriculum; partner admins can
  never read it (they resolve to their own `org_id`).

A CI test (foundation track F3) asserts isolation: for every tenant-scoped
table a cross-`org_id` read/write must fail. It blocks merge.

### Policy file order

SQL in `src/policies/` is applied **after** the generated table migration, in
this order:

1. `enable-extensions.sql` — `pgcrypto` (for `gen_random_uuid()`), `vector`
   (pgvector), `pg_trgm`. Run **first**.
2. `00_helpers.sql` — the `app` schema, `app.current_org()` /
   `app.current_role()` / `app.current_user_id()` / `app.is_org_admin()`, and
   the `set_updated_at()` trigger fn.
3. `01_rls_tenant.sql` — RLS on every tenant-scoped table.
4. `02_rls_global.sql` — RLS for global tables.

---

## pgvector setup

AI retrieval uses a private pgvector index (PROJECT.md §13.5 — no third-party
vector store). The embedding column lives on `course_chunks`:

```ts
embedding: vector("embedding", { dimensions: 1536 })
```

`vector` is a Drizzle custom type declared in `src/schema/_shared.ts` mapping to
`vector(n)`; the `vector` extension is created in `enable-extensions.sql`.
`EMBEDDING_DIMENSIONS` (`src/schema/ai.ts`, default **1536** — OpenAI
`text-embedding-3` / Bedrock Titan v2 compatible) is the single source of truth
for the dimension.

> **TODO (post-migration):** create the ANN index once data volume warrants it,
> e.g.
> ```sql
> create index course_chunks_embedding_idx on course_chunks
>   using ivfflat (embedding vector_cosine_ops) with (lists = 100);
> ```
> Build it after seeding (ivfflat needs rows to train). HNSW is an alternative
> if recall/latency demands it. Left out of the base migration deliberately so
> the index isn't built on an empty table.

---

## Migrations — generate & apply

Drizzle Kit reads `src/schema/index.ts` (see `drizzle.config.ts`) and writes
versioned SQL to `./drizzle`. The connection string comes from `DATABASE_URL`
(per-environment via Doppler — **never hardcoded**).

```bash
# Generate a migration from schema changes (writes ./drizzle/*.sql)
pnpm --filter @fxunlock/db db:generate

# Apply generated migrations
pnpm --filter @fxunlock/db db:migrate
```

> **Do not run these during parallel package scaffolding** — installs/codegen
> are centralised to avoid `node_modules` corruption.

**Full apply order** against a Supabase project (`eu-north-1`):

1. `src/policies/enable-extensions.sql`
2. generated `./drizzle/*.sql` (tables + enums)
3. `src/policies/00_helpers.sql`
4. `src/policies/01_rls_tenant.sql`
5. `src/policies/02_rls_global.sql`

In Supabase these run as migration steps (CLI `supabase db push` or the SQL
editor for the policy files) so RLS + extensions are versioned alongside the
table DDL. Each environment (dev / preview / staging / prod) is a separate
Supabase project; **no shared secrets across envs**.

---

## Transactional outbox pattern

Events must never be lost on commit (PROJECT.md §10, F3). Instead of emitting to
the queue directly (which can succeed while the DB transaction rolls back, or
vice-versa), handlers write to **`event_outbox`** in the *same transaction* as
the business mutation:

1. In one transaction: perform the mutation **and** insert an `event_outbox`
   row (`event_type`, `aggregate_type`/`aggregate_id`, `payload`,
   `status = 'pending'`). Atomic — both commit or neither does.
2. A **pg-queue publisher** (Graphile Worker / pgmq on Railway) polls
   `event_outbox` for `pending` rows in insertion order, dispatches each to the
   queue topic, and marks it `published` (or increments `attempts` / records
   `last_error`, escalating to `dead_letter` after repeated failure).
3. Consumers (workers) process the PRD §10 **Key Events**
   (`subscription.created`, `lesson.completed`, `certificate.issued`,
   `affiliate.referral_attributed`, …) idempotently — `idempotency_keys`
   dedupes redelivery.

This gives at-least-once delivery with exactly-once *effects* (via idempotency),
and the `event_outbox` table doubles as an audit/debug trail of everything the
system emitted.

---

## Usage

```ts
import { createDb, withTenant, schema } from "@fxunlock/db";

const db = createDb({ connectionString: process.env.DATABASE_URL! });

// Tenant-scoped query (API path): GUCs set for the request, RLS enforces scope.
await withTenant(db, { orgId, role: "member", userId }, async (tx) => {
  return tx.select().from(schema.trades); // only this user's trades, this org
});
```

Validation at the boundary:

```ts
import { insertTradeSchema } from "@fxunlock/db";

const parsed = insertTradeSchema.parse(requestBody); // throws on bad input
```
