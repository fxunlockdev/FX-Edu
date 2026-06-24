import { Global, Module } from '@nestjs/common';
import { AUDIT_SERVICE } from './audit.types';
import { LoggingAuditService } from './audit.service';

/**
 * Provides the AuditService behind its DI token so the AuditInterceptor (and
 * any handler that records out-of-band audit events) can depend on the
 * interface. Swap LoggingAuditService for a db-backed implementation here.
 */
@Global()
@Module({
  providers: [{ provide: AUDIT_SERVICE, useClass: LoggingAuditService }],
  exports: [AUDIT_SERVICE],
})
export class AuditModule {}
