/**
 * Sample admin-settings data (PROJECT.md §9 module 19 "Settings: roles,
 * permissions, audit logs, feature flags, disclosures"). STUBBED.
 *
 * // TODO: replace with the admin settings API. Role changes + feature-flag
 *    toggles are dangerous mutations (step-up + reason, §6.1); audit log served
 *    by `GET /admin/audit-logs` (§9 module 19 Key APIs).
 */

export interface RoleRow {
  role: string;
  permissions: string;
  mfa: string;
}

export interface FeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
}

export interface AuditLogRow {
  ts: string;
  actor: string;
  action: string;
  target: string;
}

export interface DisclosureRow {
  surface: string;
  status: string;
}

export const SAMPLE_ROLES: readonly RoleRow[] = [
  { role: 'super_admin', permissions: 'Full access incl. role management', mfa: 'Required + step-up' },
  { role: 'admin', permissions: 'All operational sections', mfa: 'Required + step-up' },
  { role: 'educator', permissions: 'Courses, lessons, webinars', mfa: 'Required' },
  { role: 'support', permissions: 'Members (read), community mod', mfa: 'Required' },
] as const;

export const SAMPLE_FLAGS: readonly FeatureFlag[] = [
  { key: 'ai_tutor', label: 'AI Tutor (Pro)', enabled: true },
  { key: 'community_pods', label: 'Community pods', enabled: true },
  { key: 'prop_firm_prep', label: 'Prop firm prep', enabled: false },
  { key: 'white_label', label: 'White-label partner portal', enabled: false },
] as const;

export const SAMPLE_AUDIT_LOG: readonly AuditLogRow[] = [
  { ts: '2026-06-26 09:14 UTC', actor: 'admin·k.lee', action: 'course.publish', target: 'crs_struct' },
  { ts: '2026-06-26 08:51 UTC', actor: 'admin·k.lee', action: 'member.suspend', target: 'usr_91de4' },
  { ts: '2026-06-25 17:03 UTC', actor: 'admin·r.diaz', action: 'revenue.refund', target: 'in_6a18' },
  { ts: '2026-06-25 15:40 UTC', actor: 'super_admin·a.fox', action: 'settings.role_change', target: 'support' },
  { ts: '2026-06-25 11:22 UTC', actor: 'admin·r.diaz', action: 'member.impersonate', target: 'usr_8fa21' },
] as const;

export const SAMPLE_DISCLOSURES: readonly DisclosureRow[] = [
  { surface: 'Risk disclaimer (global footer)', status: 'Published · v3' },
  { surface: 'AI tutor disclaimer', status: 'Published · v2' },
  { surface: 'Affiliate disclosure', status: 'Published · v1' },
  { surface: 'Trade-ideas educational notice', status: 'Draft' },
] as const;
