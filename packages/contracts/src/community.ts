import { z } from 'zod';
import { IdSchema, IsoTimestampSchema } from './common.js';
import { CursorPaginationParamsSchema } from './envelope.js';

/**
 * Community domain:
 *   GET  /community/channels
 *   POST /community/posts
 *   POST /community/reports
 *
 * (PRD §8.11, §11). Pro-only. Posts soft-delete for audit; reports feed the
 * moderation queue. Signal-selling / solicitation is banned by policy.
 */

/** A community channel. */
export const CommunityChannelSchema = z.object({
  id: IdSchema,
  name: z.string(),
  slug: z.enum([
    'general',
    'technical_analysis',
    'fundamentals',
    'psychology',
    'journaling',
    'wins_and_lessons',
    'prop_firm_prep',
  ]),
  description: z.string().nullable(),
  unread: z.number().int().nonnegative(),
});
export type CommunityChannel = z.infer<typeof CommunityChannelSchema>;

/** Response for `GET /community/channels`. */
export const ListChannelsResponseSchema = z.object({
  channels: z.array(CommunityChannelSchema),
});
export type ListChannelsResponse = z.infer<typeof ListChannelsResponseSchema>;

/** A community post as returned by the API. */
export const CommunityPostSchema = z.object({
  id: IdSchema,
  channelId: IdSchema,
  authorId: IdSchema,
  authorDisplayName: z.string(),
  body: z.string(),
  attachmentUrls: z.array(z.string().url()),
  reactionCount: z.number().int().nonnegative(),
  replyCount: z.number().int().nonnegative(),
  status: z.enum(['published', 'held', 'removed']),
  createdAt: IsoTimestampSchema,
});
export type CommunityPost = z.infer<typeof CommunityPostSchema>;

/** Query params for listing posts in a channel (cursor paginated). */
export const ListPostsQuerySchema = CursorPaginationParamsSchema.extend({
  channelId: IdSchema,
});
export type ListPostsQuery = z.infer<typeof ListPostsQuerySchema>;

/** Request body for `POST /community/posts`. */
export const CreatePostRequestSchema = z.object({
  channelId: IdSchema,
  body: z.string().min(1).max(5000),
  /** Storage keys of pre-uploaded, scanned image attachments. */
  attachmentKeys: z.array(z.string().min(1)).max(4).optional(),
});
export type CreatePostRequest = z.infer<typeof CreatePostRequestSchema>;

/** Response for `POST /community/posts`. */
export const CreatePostResponseSchema = z.object({
  post: CommunityPostSchema,
});
export type CreatePostResponse = z.infer<typeof CreatePostResponseSchema>;

/** Report target type. */
export const ReportTargetTypeSchema = z.enum(['post', 'comment', 'user']);
export type ReportTargetType = z.infer<typeof ReportTargetTypeSchema>;

/** Request body for `POST /community/reports`. */
export const CreateReportRequestSchema = z.object({
  targetType: ReportTargetTypeSchema,
  targetId: IdSchema,
  reason: z.enum([
    'spam',
    'signal_selling',
    'solicitation',
    'harassment',
    'financial_advice',
    'other',
  ]),
  note: z.string().max(1000).optional(),
});
export type CreateReportRequest = z.infer<typeof CreateReportRequestSchema>;

/** Response for `POST /community/reports`. */
export const CreateReportResponseSchema = z.object({
  reportId: IdSchema,
  status: z.enum(['received', 'auto_held']),
  createdAt: IsoTimestampSchema,
});
export type CreateReportResponse = z.infer<typeof CreateReportResponseSchema>;
