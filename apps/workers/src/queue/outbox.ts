import { and, asc, eq, inArray, lt, or, sql } from "drizzle-orm";

import type { Database } from "@fxunlock/db";
import { eventOutbox } from "@fxunlock/db/schema";

import type { OutboxEvent } from "../events/types.js";

/**
 * Transactional-outbox repository (PROJECT.md §6/F3).
 *
 * The API/services write events into `event_outbox` in the same transaction as
 * the state change, so events are never lost on commit. This worker claims
 * pending rows, processes them, and marks the row `published` (success) or
 * `failed` / `dead_letter` (after exhausting retries).
 *
 * Claiming uses `FOR UPDATE SKIP LOCKED` so multiple worker instances can poll
 * concurrently without handing the same row to two consumers — the standard
 * pg-queue claim. The real production runtime is Graphile Worker / pgmq, which
 * provides this plus scheduling and backoff out of the box.
 *
 * // TODO: wire Graphile Worker — replace this hand-rolled claim/poll with
 * //       graphile-worker's job runner (it manages locking, retries, and
 * //       exponential backoff natively). This module documents the contract
 * //       so the swap is behind a stable interface.
 */

/** Max delivery attempts before a row is parked in `dead_letter`. */
export const MAX_ATTEMPTS = 5;

/**
 * Claim up to `limit` due rows for processing, atomically flipping them to
 * `processing` so a sibling worker won't pick them up. A row is "due" when it is
 * `pending`, or `failed` whose backoff window has elapsed (retry).
 */
export async function claimDueEvents(
  db: Database,
  limit: number,
  now: Date = new Date(),
): Promise<ReadonlyArray<OutboxEvent>> {
  // Retry gate: failed rows become due again once `lastAttemptedAt` is older
  // than their backoff window. We approximate "elapsed" via SQL so the check is
  // race-free with the claim. Pending rows are always due.
  const retryReady = and(
    eq(eventOutbox.status, "failed"),
    lt(eventOutbox.attempts, MAX_ATTEMPTS),
    or(
      sql`${eventOutbox.lastAttemptedAt} is null`,
      sql`${eventOutbox.lastAttemptedAt} <= ${now.toISOString()}::timestamptz - (interval '1 second' * power(2, ${eventOutbox.attempts}))`,
    ),
  );

  const due = or(eq(eventOutbox.status, "pending"), retryReady);

  // SELECT ... FOR UPDATE SKIP LOCKED inside a tx, then mark `processing`.
  return db.transaction(async (tx) => {
    const rows = await tx
      .select({
        id: eventOutbox.id,
        eventType: eventOutbox.eventType,
        orgId: eventOutbox.orgId,
        payload: eventOutbox.payload,
        attempts: eventOutbox.attempts,
      })
      .from(eventOutbox)
      .where(due)
      .orderBy(asc(eventOutbox.createdAt))
      .limit(limit)
      .for("update", { skipLocked: true });

    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    await tx
      .update(eventOutbox)
      .set({ status: "processing", lastAttemptedAt: now, updatedAt: now })
      .where(inArray(eventOutbox.id, ids));

    return rows.map((r) => ({
      id: r.id,
      eventType: r.eventType,
      orgId: r.orgId,
      payload: r.payload,
      attempts: r.attempts,
    }));
  });
}

/** Mark a row successfully published (terminal success state). */
export async function markPublished(
  db: Database,
  id: string,
  now: Date = new Date(),
): Promise<void> {
  await db
    .update(eventOutbox)
    .set({ status: "published", publishedAt: now, lastError: null, updatedAt: now })
    .where(eq(eventOutbox.id, id));
}

/**
 * Mark a row failed. If attempts are exhausted, park it in `dead_letter`
 * (terminal); otherwise leave it `failed` so the backoff gate retries it later.
 */
export async function markFailed(
  db: Database,
  event: OutboxEvent,
  error: string,
  now: Date = new Date(),
): Promise<void> {
  const nextAttempts = event.attempts + 1;
  const status = nextAttempts >= MAX_ATTEMPTS ? "dead_letter" : "failed";
  await db
    .update(eventOutbox)
    .set({
      status,
      attempts: nextAttempts,
      lastError: error.slice(0, 2000),
      lastAttemptedAt: now,
      updatedAt: now,
    })
    .where(eq(eventOutbox.id, event.id));
}

/** Skip an unhandled/irrelevant event by acking it (publish, no-op). */
export async function markSkipped(
  db: Database,
  id: string,
  now: Date = new Date(),
): Promise<void> {
  await markPublished(db, id, now);
}

/**
 * Reclaim rows stuck in `processing` longer than `staleAfterMs` (a worker
 * crashed mid-dispatch). Flips them back to `failed` so the retry/backoff gate
 * re-claims them. A cron job calls this periodically; Graphile Worker handles
 * this natively once wired.
 *
 * // TODO: wire Graphile Worker — its visibility-timeout makes this unnecessary.
 */
export async function reclaimStaleProcessing(
  db: Database,
  staleAfterMs: number = 5 * 60_000,
  now: Date = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - staleAfterMs).toISOString();
  const reclaimed = await db
    .update(eventOutbox)
    .set({ status: "failed", lastError: "reclaimed: stale processing", updatedAt: now })
    .where(
      and(
        eq(eventOutbox.status, "processing"),
        lt(eventOutbox.lastAttemptedAt, sql`${cutoff}::timestamptz`),
      ),
    )
    .returning({ id: eventOutbox.id });
  return reclaimed.length;
}
