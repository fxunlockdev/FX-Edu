import { Injectable, Logger } from '@nestjs/common';
import type { AuditRecord, AuditService } from './audit.types';

/**
 * Temporary audit sink.
 *
 * Logs each audit record through the (redacting) Pino logger so we have a
 * traceable trail today, but does NOT yet persist to the durable audit_logs
 * table. The contract (AuditService) is stable; only the body changes when wired.
 *
 * TODO: wire @fxunlock/db — write each record to the append-only `audit_logs`
 * table inside the same transaction as the mutation (transactional outbox), so
 * the trail can never diverge from the action.
 */
@Injectable()
export class LoggingAuditService implements AuditService {
  private readonly logger = new Logger('Audit');

  async record(entry: AuditRecord): Promise<void> {
    this.logger.log(entry, 'audit');
  }
}
