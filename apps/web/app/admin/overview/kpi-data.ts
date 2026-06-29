/**
 * Sample KPI data for the Admin Overview (PROJECT.md §9 module 19 "Overview
 * KPIs"). STUBBED — not wired to any data source. The real values come from
 * analytics replicas with cached aggregates (§9 module 19 📈).
 *
 * // TODO: replace with `GET /admin/overview` (cached KPI aggregates off the
 *    read replica); reads, like mutations, must be access-audited.
 */

export type KpiTrend = 'up' | 'down' | 'flat';

export interface Kpi {
  label: string;
  value: string;
  /** e.g. "+4.2% MoM"; empty string renders no delta. */
  delta: string;
  trend: KpiTrend;
  /** Marks a KPI that warrants operational attention (e.g. failed payments). */
  alert?: boolean;
}

/** The eight headline KPIs required by §9 module 19. Frozen sample values. */
export const OVERVIEW_KPIS: readonly Kpi[] = [
  { label: 'Members', value: '12,840', delta: '+312 this month', trend: 'up' },
  { label: 'MRR', value: '$184,500', delta: '+6.1% MoM', trend: 'up' },
  { label: 'Churn', value: '3.4%', delta: '-0.5pt MoM', trend: 'up' },
  { label: 'Active learners', value: '7,920', delta: '+1.8% WoW', trend: 'up' },
  { label: 'Webinar attendance', value: '1,460', delta: 'last 30 days', trend: 'flat' },
  { label: 'AI usage', value: '38,210', delta: 'queries / 30d', trend: 'up' },
  { label: 'Community reports', value: '17', delta: 'open in queue', trend: 'flat' },
  { label: 'Failed payments', value: '42', delta: '+9 vs last week', trend: 'down', alert: true },
] as const;
