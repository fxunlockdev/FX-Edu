import { Injectable } from '@nestjs/common';
import type { IdempotencyStore } from './idempotency.types';

/**
 * Temporary in-process idempotency store.
 *
 * Correct for a single instance, but NOT durable and NOT shared across the
 * Railway replica set — so it is a stand-in only.
 *
 * TODO: wire @fxunlock/db / Upstash Redis — persist processed event ids in the
 * `idempotency_keys` table (or Redis with a TTL) so replays are no-ops across
 * restarts and across all instances.
 */
@Injectable()
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly seenKeys = new Set<string>();

  async seen(key: string): Promise<boolean> {
    return this.seenKeys.has(key);
  }

  async remember(key: string): Promise<void> {
    this.seenKeys.add(key);
  }
}
