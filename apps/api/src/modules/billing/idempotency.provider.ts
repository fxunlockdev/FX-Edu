import { Logger, type Provider } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { IDEMPOTENCY_STORE, type IdempotencyStore } from './idempotency.types';
import { InMemoryIdempotencyStore } from './in-memory-idempotency.store';
import { PostgresIdempotencyStore } from './postgres-idempotency.store';

/**
 * Selects the idempotency store implementation (resolves review CRITICAL-2).
 *
 * The durable, cross-instance {@link PostgresIdempotencyStore} is the default.
 * The in-memory store is a single-instance, non-durable stand-in for local dev
 * and tests only — selecting it in production is a correctness bug (replays
 * across replicas/restarts would be reprocessed), so this factory FAILS FAST
 * rather than booting an unsafe configuration.
 *
 * `USE_IN_MEMORY_IDEMPOTENCY=true` is the only way to opt into the in-memory
 * store, and it is rejected when `NODE_ENV === 'production'`.
 */
export const idempotencyStoreProvider: Provider = {
  provide: IDEMPOTENCY_STORE,
  inject: [ConfigService, PostgresIdempotencyStore, InMemoryIdempotencyStore],
  useFactory: (
    config: ConfigService,
    postgresStore: PostgresIdempotencyStore,
    inMemoryStore: InMemoryIdempotencyStore,
  ): IdempotencyStore => {
    const logger = new Logger('IdempotencyStore');

    if (!config.useInMemoryIdempotency) {
      logger.log('Using durable Postgres idempotency store.');
      return postgresStore;
    }

    if (config.isProduction) {
      // Startup guard: never run the non-durable fallback in production.
      throw new Error(
        '[billing] In-memory idempotency store is not permitted in production. ' +
          'Unset USE_IN_MEMORY_IDEMPOTENCY so the durable Postgres store is used.',
      );
    }

    logger.warn(
      'Using IN-MEMORY idempotency store (non-durable, single instance). ' +
        'Dev/test only — webhook replays are not deduped across restarts.',
    );
    return inMemoryStore;
  },
};
