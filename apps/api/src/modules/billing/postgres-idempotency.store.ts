import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { idempotencyKeys, type Database } from '@fxunlock/db';
import { DB } from '../db/db.tokens';
import type { IdempotencyStore } from './idempotency.types';

/** Namespace so a Stripe event id can never collide with another endpoint's key. */
const STRIPE_WEBHOOK_SCOPE = 'stripe_webhook';

/**
 * Durable, cross-instance idempotency store (resolves review CRITICAL-2).
 *
 * Backed by the global `idempotency_keys` table (PROJECT.md §10), keyed on
 * `(scope, key)`. A processed Stripe event id is persisted, so a replay — even
 * after a restart or on a different Railway replica — is a no-op.
 *
 * `remember` is insert-if-absent: it relies on the `(scope, key)` unique index
 * and `onConflictDoNothing`, treating a conflict (the row already exists) as
 * "already processed" rather than an error. This keeps the two-phase
 * {@link IdempotencyStore} contract correct even under concurrent delivery —
 * the unique constraint is the real arbiter, not the earlier `seen` read.
 */
@Injectable()
export class PostgresIdempotencyStore implements IdempotencyStore {
  constructor(@Inject(DB) private readonly db: Database) {}

  async seen(key: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: idempotencyKeys.id })
      .from(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.scope, STRIPE_WEBHOOK_SCOPE),
          eq(idempotencyKeys.key, key),
        ),
      )
      .limit(1);
    return rows.length > 0;
  }

  async remember(key: string): Promise<void> {
    // Insert-if-absent: a unique-index conflict means another delivery already
    // recorded this event — a no-op, not a failure.
    await this.db
      .insert(idempotencyKeys)
      .values({ scope: STRIPE_WEBHOOK_SCOPE, key })
      .onConflictDoNothing({
        target: [idempotencyKeys.scope, idempotencyKeys.key],
      });
  }
}
