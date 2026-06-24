import { z } from 'zod';
import {
  AccessLevelSchema,
  DecisionSchema,
  IdSchema,
  IsoTimestampSchema,
} from './common.js';
import { CursorPaginationParamsSchema } from './envelope.js';

/**
 * Webinars domain:
 *   GET  /webinars
 *   POST /webinars/:id/register
 *
 * (PRD §8.6, §11). Public free webinars register with name + email; Pro/Elite
 * sessions are entitlement-gated. Join tokens are minted separately after the
 * entitlement + registration check.
 */

/** Webinar lifecycle state. */
export const WebinarStatusSchema = z.enum([
  'scheduled',
  'live',
  'ended',
  'canceled',
]);
export type WebinarStatus = z.infer<typeof WebinarStatusSchema>;

/** Webinar topic categories (PRD §8.6). */
export const WebinarTopicSchema = z.enum([
  'technical_analysis',
  'fundamental_analysis',
  'mindset',
]);
export type WebinarTopic = z.infer<typeof WebinarTopicSchema>;

/** A webinar summary card. */
export const WebinarSummarySchema = z.object({
  id: IdSchema,
  title: z.string(),
  description: z.string(),
  host: z.string(),
  topic: WebinarTopicSchema,
  accessLevel: AccessLevelSchema,
  startsAt: IsoTimestampSchema,
  endsAt: IsoTimestampSchema,
  status: WebinarStatusSchema,
  recordingEnabled: z.boolean(),
  registrationCap: z.number().int().positive().nullable(),
  registeredCount: z.number().int().nonnegative(),
  /** Caller's resolved access (allow|deny|locked). */
  decision: DecisionSchema,
  /** Whether the caller already holds a seat. */
  registered: z.boolean(),
});
export type WebinarSummary = z.infer<typeof WebinarSummarySchema>;

/** Query params for `GET /webinars`. */
export const ListWebinarsQuerySchema = CursorPaginationParamsSchema.extend({
  status: WebinarStatusSchema.optional(),
  topic: WebinarTopicSchema.optional(),
  /** "upcoming" | "replays" view (PRD §8.6 replay library). */
  view: z.enum(['upcoming', 'replays']).default('upcoming'),
});
export type ListWebinarsQuery = z.infer<typeof ListWebinarsQuerySchema>;

/** Response for `GET /webinars`. */
export const ListWebinarsResponseSchema = z.object({
  webinars: z.array(WebinarSummarySchema),
});
export type ListWebinarsResponse = z.infer<typeof ListWebinarsResponseSchema>;

/**
 * Request body for `POST /webinars/:id/register`.
 *
 * For a member the identity comes from the JWT; for a public free webinar the
 * visitor supplies name + email (PRD §8.6). Both shapes are accepted; the API
 * picks the relevant one based on access level + auth state.
 */
export const WebinarRegisterRequestSchema = z.object({
  /** Required for public/free registration; ignored for authed members. */
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
  /** Whether to set calendar reminders (confirm/24h/1h/30m). */
  remindersEnabled: z.boolean().default(true),
});
export type WebinarRegisterRequest = z.infer<typeof WebinarRegisterRequestSchema>;

/** Response for `POST /webinars/:id/register`. */
export const WebinarRegisterResponseSchema = z.object({
  webinarId: IdSchema,
  status: z.enum(['registered', 'waitlisted']),
  registeredAt: IsoTimestampSchema,
});
export type WebinarRegisterResponse = z.infer<typeof WebinarRegisterResponseSchema>;
