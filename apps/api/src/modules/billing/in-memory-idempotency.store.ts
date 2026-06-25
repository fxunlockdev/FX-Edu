import { Injectable } from '@nestjs/common';
import type { IdempotencyStore } from './idempotency.types';

/**
 * In-process idempotency store — DEV/TEST ONLY.
 *
 * Correct for a single instance, but NOT durable and NOT shared across the
 * Railway replica set. The durable {@link PostgresIdempotencyStore} is the
 * production binding (resolves review CRITICAL-2); the billing idempotency
 * provider only selects this fallback when `USE_IN_MEMORY_IDEMPOTENCY=true`,
 * and rejects it outright under `NODE_ENV=production`.
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
