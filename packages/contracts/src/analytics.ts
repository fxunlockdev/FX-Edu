import { z } from 'zod';
import { IsoTimestampSchema } from './common.js';

/**
 * Performance analytics domain — `GET /analytics` (PRD §8.9, §11).
 *
 * Pro-only. Derived from the user's own journal data. AI insights are
 * behavioral and explicitly non-advisory — never live-trade recommendations.
 */

/** Query params for `GET /analytics`. */
export const AnalyticsQuerySchema = z.object({
  /** Inclusive ISO date bounds for the range selector. */
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  /** Include open trades in the computation (default excludes them, §8.9). */
  includeOpen: z.coerce.boolean().default(false),
});
export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>;

/** A single (label, value) chart point. */
export const ChartPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});
export type ChartPoint = z.infer<typeof ChartPointSchema>;

/** A timeseries point (e.g. net R over time). */
export const TimeseriesPointSchema = z.object({
  at: IsoTimestampSchema,
  value: z.number(),
});
export type TimeseriesPoint = z.infer<typeof TimeseriesPointSchema>;

/** Non-advisory behavioral insight. */
export const AnalyticsInsightSchema = z.object({
  kind: z.enum([
    'best_session',
    'loss_cluster',
    'best_setup',
    'behavioral_leak',
  ]),
  /** Educational, non-advisory summary text. */
  message: z.string().min(1),
});
export type AnalyticsInsight = z.infer<typeof AnalyticsInsightSchema>;

/** Response for `GET /analytics`. */
export const AnalyticsResponseSchema = z.object({
  summary: z.object({
    winRate: z.number().min(0).max(1),
    avgR: z.number(),
    netR: z.number(),
    avgRiskPercent: z.number().min(0),
    tradesAnalyzed: z.number().int().nonnegative(),
    consistencyGrade: z.string(),
  }),
  charts: z.object({
    netROverTime: z.array(TimeseriesPointSchema),
    winRateBySession: z.array(ChartPointSchema),
    winRateByDayOfWeek: z.array(ChartPointSchema),
    avgRBySetup: z.array(ChartPointSchema),
    rByPair: z.array(ChartPointSchema),
  }),
  insights: z.array(AnalyticsInsightSchema),
  generatedAt: IsoTimestampSchema,
});
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>;
