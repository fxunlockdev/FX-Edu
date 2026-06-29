import type { Logger } from "pino";

import type { Database } from "@fxunlock/db";

import type { Dispatcher } from "../notifications/dispatcher.js";
import { getHandler } from "../handlers/index.js";
import { isHandledEventType, type OutboxEvent } from "../events/types.js";
import {
  claimDueEvents,
  markFailed,
  markPublished,
  markSkipped,
} from "./outbox.js";

/**
 * Outbox consumer loop (transactional-outbox pattern).
 *
 * `processEvent` handles exactly one claimed row: skip if unhandled, else
 * validate → resolve → dispatch (preference-aware) → mark published/failed.
 * `runWorker` is the long-lived poll loop; it is SAFE TO IMPORT — nothing runs
 * until you call it, and it stops cleanly via the AbortSignal.
 *
 * Idempotency: marking the row `published` (or `dead_letter`) is the idempotency
 * boundary — a row is claimed via FOR UPDATE SKIP LOCKED, so it is dispatched
 * once per claim; a crash mid-dispatch leaves it `processing` and a future
 * sweep re-claims it. Email is at-least-once by design (acceptable for
 * lifecycle mail); the in-app write could be made exactly-once with a unique
 * key on (outbox_id) when stricter dedupe is needed.
 *
 * // TODO: wire Graphile Worker — its job runner replaces this poll loop and
 * //       provides locking + exponential backoff natively.
 */

export interface WorkerDeps {
  readonly db: Database;
  readonly dispatcher: Dispatcher;
  readonly logger: Logger;
}

export interface WorkerOptions {
  /** Rows claimed per poll. */
  readonly batchSize?: number;
  /** Idle wait (ms) when a poll finds no due rows. */
  readonly idleMs?: number;
  /** Stop signal for graceful shutdown. */
  readonly signal?: AbortSignal;
}

/**
 * Process a single claimed event end-to-end. Returns the outcome so the loop
 * can log throughput. Never throws — failures are recorded on the row.
 */
export async function processEvent(
  deps: WorkerDeps,
  event: OutboxEvent,
): Promise<"published" | "skipped" | "failed"> {
  const { db, dispatcher, logger } = deps;

  if (!isHandledEventType(event.eventType)) {
    await markSkipped(db, event.id);
    logger.debug({ eventType: event.eventType, id: event.id }, "outbox.skipped");
    return "skipped";
  }

  const handler = getHandler(event.eventType);
  if (!handler) {
    await markSkipped(db, event.id);
    return "skipped";
  }

  try {
    const notification = handler(event.payload);
    const result = await dispatcher.dispatch(notification);

    // A channel error means we couldn't deliver — fail so the row retries with
    // backoff. (If both channels were merely opted-out, that's a clean success.)
    if (result.hadError) {
      await markFailed(db, event, "channel delivery error");
      logger.warn({ id: event.id, eventType: event.eventType }, "outbox.partial_failure");
      return "failed";
    }

    await markPublished(db, event.id);
    logger.info(
      {
        id: event.id,
        eventType: event.eventType,
        emailSent: result.emailSent,
        inAppWritten: result.inAppWritten,
        emailSkipped: result.emailSkipped,
        inAppSkipped: result.inAppSkipped,
      },
      "outbox.published",
    );
    return "published";
  } catch (error: unknown) {
    // A Zod validation error or any other throw → record and let backoff retry.
    const reason = error instanceof Error ? error.message : "Unknown error";
    await markFailed(db, event, reason);
    logger.error({ id: event.id, eventType: event.eventType, err: reason }, "outbox.failed");
    return "failed";
  }
}

/**
 * Long-lived poll loop. Claims a batch, processes each row, then either
 * immediately re-polls (work was found) or idles. Resolves when the signal
 * aborts — never on its own, so callers control lifetime.
 */
export async function runWorker(
  deps: WorkerDeps,
  options: WorkerOptions = {},
): Promise<void> {
  const batchSize = options.batchSize ?? 25;
  const idleMs = options.idleMs ?? 2000;
  const { signal } = options;

  deps.logger.info({ batchSize, idleMs }, "worker.started");

  while (!signal?.aborted) {
    let claimed: ReadonlyArray<OutboxEvent> = [];
    try {
      claimed = await claimDueEvents(deps.db, batchSize);
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      deps.logger.error({ err: reason }, "worker.claim_failed");
      await delay(idleMs, signal);
      continue;
    }

    if (claimed.length === 0) {
      await delay(idleMs, signal);
      continue;
    }

    for (const event of claimed) {
      if (signal?.aborted) break;
      await processEvent(deps, event);
    }
  }

  deps.logger.info("worker.stopped");
}

/** Abortable sleep — resolves early if the signal fires. */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) return resolve();
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      resolve();
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
