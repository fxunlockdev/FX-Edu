import { Injectable, Logger } from '@nestjs/common';
import type {
  EntitlementUpdate,
  EntitlementWriter,
} from './entitlement-writer.types';

/**
 * Stub entitlement writer — logs the intended change but does not yet persist.
 *
 * TODO: wire @fxunlock/db — upsert `subscriptions` + `entitlements` idempotently
 * keyed on sourceEventId, then emit `entitlement.changed` to the pg-queue so the
 * Redis entitlement cache is invalidated (§6.2). Downgrades must preserve data
 * and only flip gated views to locked.
 */
@Injectable()
export class StubEntitlementWriter implements EntitlementWriter {
  private readonly logger = new Logger('EntitlementWriter');

  async apply(update: EntitlementUpdate): Promise<void> {
    this.logger.log(
      {
        stripeCustomerId: update.stripeCustomerId,
        plan: update.plan,
        status: update.status,
        sourceEventId: update.sourceEventId,
      },
      'entitlement.update (stub — not persisted)',
    );
  }
}
