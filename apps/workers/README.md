# @fxunlock/workers

Background worker service for FX Academy (FX Unlock) — **M15 Lifecycle Messaging**.

Consumes the transactional **`event_outbox`** (PROJECT.md §6 / F3), and for each
lifecycle event fans out to **email (Resend)** + **in-app notifications**,
respecting each user's **`notification_preferences`** (PRD §8.16). Opted-out
users are never emailed.

## What it does

```
event_outbox row ──claim──► handler ──► ResolvedNotification ──► dispatcher
                                                                    │
                                          ┌─────────────────────────┤
                                  (pref-aware fan-out)              │
                                          ▼                          ▼
                                  notifications table        Resend email
                                  (in-app inbox)             (LogMailer in dev)
```

## Layout

| Path | Responsibility |
|------|----------------|
| `src/config/env.ts` | Zod-validated env, fail-fast; refuses LogMailer in prod |
| `src/observability/logger.ts` | pino logger (JSON in prod, pretty in dev, redacted) |
| `src/events/types.ts` | Typed event taxonomy + Zod payload schemas (boundary validation) |
| `src/queue/outbox.ts` | Outbox repository — claim (`FOR UPDATE SKIP LOCKED`), mark published/failed/dead-letter, retry/backoff |
| `src/queue/worker.ts` | `processEvent` (one row) + `runWorker` (poll loop, safe to import) |
| `src/email/mailer.ts` | `Mailer` interface, `ResendMailer`, `LogMailer` + `resolveMailer` guard |
| `src/email/templates/` | Pure `props → { subject, html, text }` templates (§8.16) |
| `src/notifications/preferences.ts` | **Pure** preference-resolution logic (unit-tested) |
| `src/notifications/store.ts` | Drizzle repository: load prefs + write in-app rows |
| `src/notifications/dispatcher.ts` | Preference-respecting fan-out to email + in-app |
| `src/handlers/index.ts` | Event → template + in-app notification mapping |
| `src/main.ts` | Bootstrap with graceful shutdown (SIGINT/SIGTERM) |

## Events handled (M15)

| Outbox `event_type` | Notification type | Template |
|---------------------|-------------------|----------|
| `certificate.issued` | `certificate_earned` | Certificate earned |
| `subscription.past_due` | `failed_payment` | Failed payment |
| `webinar.reminder_due` | `webinar_reminder` | Webinar reminder |
| `commission.earned` | `affiliate_payout` | Affiliate payout |
| `partner.domain_verified` | `partner_domain_verification` | Partner domain verified |

Templates also exist for the remaining §8.16 types (new trade idea, community
reply, weekly progress digest, product update) ready to wire to their events.

## Email templates (§8.16)

Webinar reminder · New trade idea · Community reply · Weekly progress digest ·
Product update · Certificate earned · Failed payment · Affiliate payout ·
Partner domain verification. Each is a pure typed function (no heavy email lib).

## Preference policy

**Opt-out, not opt-in.** A channel fires unless an explicit
`notification_preferences` row sets `enabled = false` for that `(channel, type)`
— matching the DB column default. Email and in-app are independent: a user can
keep the inbox on while turning email off.

## Reliability

- **Idempotency / claim:** rows are claimed with `FOR UPDATE SKIP LOCKED`, so
  multiple instances never double-process. Marking a row `published` is the
  idempotency boundary.
- **Retry/backoff:** failed rows retry with exponential backoff
  (`2^attempts` seconds) up to `MAX_ATTEMPTS = 5`, then move to `dead_letter`.
- **Graceful shutdown:** an in-flight batch finishes before exit.

> **Runtime note:** the queue layer is a hand-rolled poll/claim **skeleton**.
> The production runtime is **Graphile Worker / pgmq** (PROJECT.md §2), which
> provides locking, scheduling, and backoff natively. See the
> `// TODO: wire Graphile Worker` markers in `src/queue/`. The swap sits behind
> the stable `outbox.ts` / `worker.ts` interface.

## Dev / run

```bash
cp .env.example .env      # fill DATABASE_URL; RESEND_* optional in dev
pnpm --filter @fxunlock/workers dev        # node --watch
pnpm --filter @fxunlock/workers typecheck
pnpm --filter @fxunlock/workers test       # vitest
pnpm --filter @fxunlock/workers build && pnpm --filter @fxunlock/workers start
```

Without `RESEND_API_KEY`, dev uses the **LogMailer** (logs subject + recipient,
sends nothing). Production refuses to start without `RESEND_API_KEY` +
`RESEND_FROM`.
