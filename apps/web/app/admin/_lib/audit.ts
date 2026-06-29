/**
 * Admin audit + step-up scaffolding (PROJECT.md §6.7 / §9 module 19 🔒).
 *
 * PROJECT.md §6.7: "Every admin mutation writes an audit log
 * (`actor, action, target, metadata, IP, UA, ts`); dangerous actions require a
 * reason note + step-up." This module is the placeholder that every admin
 * mutation funnels through so the contract is visible in code now, long before
 * the backend exists. Nothing here performs I/O yet — the mutations are no-ops.
 */

/** The exact audit-row shape mandated by §6.7. */
export interface AuditEntry {
  /** Acting admin (user id / pseudonymized actor). */
  actor: string;
  /** What was attempted, e.g. `member.suspend`, `member.impersonate`. */
  action: string;
  /** What it was done to, e.g. a member id. */
  target: string;
  /** Free-form context (old/new values, scope, ticket ref…). */
  metadata?: Record<string, unknown>;
  /** Required reason note for DANGEROUS actions (§6.7). */
  reason?: string;
  /** Request IP — filled server-side at write time. */
  ip?: string;
  /** Request User-Agent — filled server-side at write time. */
  ua?: string;
  /** ISO timestamp — filled server-side at write time. */
  ts?: string;
}

/**
 * Actions classified as DANGEROUS: they require a reason note AND fresh step-up
 * MFA before they may run (§6.1 step-up, §6.7 reason note). The UI surfaces this
 * via a confirm + reason prompt; the server re-verifies — UI is only a hint.
 */
export const DANGEROUS_ACTIONS = [
  'member.suspend',
  'member.ban',
  'member.impersonate',
  'member.gdpr_delete',
  'member.gdpr_export',
  'revenue.refund',
  'course.publish',
  'course.delete',
  'settings.role_change',
  'settings.feature_flag',
] as const;
export type DangerousAction = (typeof DANGEROUS_ACTIONS)[number];

export function isDangerousAction(action: string): action is DangerousAction {
  return (DANGEROUS_ACTIONS as readonly string[]).includes(action);
}

/**
 * STUB audit writer. Every admin mutation MUST call this. Today it is a no-op
 * (no backend), but its presence makes the audit contract explicit and greppable.
 *
 * // TODO §6.7: persist the entry to `admin_audit_logs` (server-side), stamping
 *    actor/ip/ua/ts from the request; for dangerous actions, require a verified
 *    step-up token (§6.1) and a non-empty `reason` BEFORE the mutation commits.
 */
export function auditStub(entry: AuditEntry): void {
  // The real implementation would REJECT a dangerous action that arrives without
  // a reason note + verified step-up; the stub only records that intent.
  const needsStepUp = isDangerousAction(entry.action) && !entry.reason;

  // TODO §6.7: persist `entry` server-side (stamping actor/ip/ua/ts) and, when
  // `needsStepUp`, hard-fail before the mutation commits (§6.1 step-up).
  void needsStepUp;
  void entry;
}
