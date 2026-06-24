import { z } from 'zod';
import { DecisionSchema, IdSchema, IsoTimestampSchema, PlanSchema } from './common.js';

/**
 * Dashboard domain — `GET /dashboard`.
 *
 * Aggregated, server-personalized home payload (PRD §8.3). Locked cards carry a
 * `decision` so the client renders a designed locked state with an upgrade CTA
 * and never receives protected content it cannot show.
 */

/** A single onboarding checklist item (new-user state). */
export const ChecklistItemSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  done: z.boolean(),
});

/** A card that may be locked behind a higher plan. */
const lockableCard = <TBody extends z.ZodTypeAny>(body: TBody) =>
  z.object({
    decision: DecisionSchema,
    /** Present only when `decision === 'allow'`; null for locked cards. */
    data: body.nullable(),
  });

/** Continue-learning snapshot. */
export const ContinueLearningSchema = z.object({
  lessonId: IdSchema,
  courseTitle: z.string(),
  lessonTitle: z.string(),
  progressPercent: z.number().min(0).max(100),
});

/** Live market quote summary card row. */
export const QuoteCardSchema = z.object({
  instrument: z.string(),
  price: z.number(),
  changePercent: z.number(),
  asOf: IsoTimestampSchema,
  /** Calm degraded state when the provider is unavailable (PRD §8.3). */
  stale: z.boolean(),
});

/** Upcoming webinar card. */
export const UpcomingWebinarSchema = z.object({
  webinarId: IdSchema,
  title: z.string(),
  host: z.string(),
  startsAt: IsoTimestampSchema,
  registered: z.boolean(),
});

/** Response payload for `GET /dashboard`. */
export const DashboardResponseSchema = z.object({
  greeting: z.string(),
  plan: PlanSchema,
  streakDays: z.number().int().nonnegative(),
  xp: z.number().int().nonnegative(),
  /** Guided checklist for new users; empty once onboarding is complete. */
  checklist: z.array(ChecklistItemSchema),
  continueLearning: ContinueLearningSchema.nullable(),
  prices: z.array(QuoteCardSchema),
  upcomingWebinar: lockableCard(UpcomingWebinarSchema),
  journalSnapshot: lockableCard(
    z.object({
      tradesThisWeek: z.number().int().nonnegative(),
      netRLast30d: z.number(),
    }),
  ),
  analyticsCard: lockableCard(
    z.object({
      winRate: z.number().min(0).max(1),
      consistencyGrade: z.string(),
    }),
  ),
  communityCard: lockableCard(
    z.object({ unread: z.number().int().nonnegative() }),
  ),
});
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
