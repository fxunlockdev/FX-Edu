/**
 * Audit record for a mutating action. Shape mirrors the PRD `audit_logs` entity
 * and §6.7's requirement: every mutation writes {actor, action, target,
 * metadata, IP, UA, ts}. Records are immutable once created.
 */
export interface AuditRecord {
  readonly actorId: string | null;
  readonly orgId: string | null;
  readonly action: string;
  readonly target: string;
  readonly method: string;
  readonly path: string;
  readonly statusCode: number;
  readonly ip: string | null;
  readonly userAgent: string | null;
  readonly timestamp: string;
}

/**
 * Persistence boundary for audit records. The interceptor depends on this
 * interface, never on a concrete store, so the real implementation can be wired
 * to @fxunlock/db without touching call sites.
 */
export interface AuditService {
  record(entry: AuditRecord): Promise<void>;
}

export const AUDIT_SERVICE = 'FX_AUDIT_SERVICE';
