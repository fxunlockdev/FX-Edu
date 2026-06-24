import { z } from 'zod';
import {
  IdSchema,
  IsoTimestampSchema,
  TradeDirectionSchema,
} from './common.js';
import { CursorPaginationParamsSchema } from './envelope.js';

/**
 * Trade journal domain:
 *   GET  /journal/trades
 *   POST /journal/trades
 *
 * (PRD §8.8, §11). R-multiple and win/loss are recomputed server-side; the
 * client never supplies them. Private user data — RLS-scoped.
 */

/** Trade outcome. */
export const TradeResultSchema = z.enum(['open', 'win', 'loss', 'breakeven']);
export type TradeResult = z.infer<typeof TradeResultSchema>;

/** Trading session a trade was taken in. */
export const TradeSessionSchema = z.enum([
  'sydney',
  'tokyo',
  'london',
  'new_york',
]);
export type TradeSession = z.infer<typeof TradeSessionSchema>;

/** A logged trade as returned by the API (server-computed fields included). */
export const TradeSchema = z.object({
  id: IdSchema,
  instrument: z.string().min(1).max(20),
  direction: TradeDirectionSchema,
  setup: z.string().max(80).nullable(),
  session: TradeSessionSchema.nullable(),
  entry: z.number().positive(),
  stopLoss: z.number().positive(),
  takeProfit: z.number().positive().nullable(),
  result: TradeResultSchema,
  /** Server-computed R-multiple; null for open trades. */
  rMultiple: z.number().nullable(),
  emotionScore: z.number().int().min(1).max(10).nullable(),
  thesis: z.string().max(2000).nullable(),
  whatDifferently: z.string().max(2000).nullable(),
  isDraft: z.boolean(),
  createdAt: IsoTimestampSchema,
});
export type Trade = z.infer<typeof TradeSchema>;

/** Query params for `GET /journal/trades`. */
export const ListTradesQuerySchema = CursorPaginationParamsSchema.extend({
  instrument: z.string().max(20).optional(),
  result: TradeResultSchema.optional(),
  session: TradeSessionSchema.optional(),
  setup: z.string().max(80).optional(),
  /** Inclusive ISO date bounds for the date-range filter. */
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});
export type ListTradesQuery = z.infer<typeof ListTradesQuerySchema>;

/** Server-computed journal summary (PRD §8.8). */
export const JournalSummarySchema = z.object({
  tradesThisWeek: z.number().int().nonnegative(),
  winRate: z.number().min(0).max(1),
  avgRR: z.number().nullable(),
  netRLast30d: z.number(),
  bestPair: z.string().nullable(),
  avgEmotion: z.number().min(1).max(10).nullable(),
});
export type JournalSummary = z.infer<typeof JournalSummarySchema>;

/** Response for `GET /journal/trades` (list + summary; meta carries cursor). */
export const ListTradesResponseSchema = z.object({
  trades: z.array(TradeSchema),
  summary: JournalSummarySchema,
});
export type ListTradesResponse = z.infer<typeof ListTradesResponseSchema>;

/**
 * Request body for `POST /journal/trades`.
 *
 * Note: `rMultiple` and win/loss are intentionally absent — the server computes
 * them from entry/stop/target/result. Clients cannot forge performance stats.
 */
export const CreateTradeRequestSchema = z
  .object({
    instrument: z.string().min(1).max(20),
    direction: TradeDirectionSchema,
    setup: z.string().max(80).optional(),
    session: TradeSessionSchema.optional(),
    entry: z.number().positive(),
    stopLoss: z.number().positive(),
    takeProfit: z.number().positive().optional(),
    result: TradeResultSchema,
    emotionScore: z.number().int().min(1).max(10).optional(),
    thesis: z.string().max(2000).optional(),
    whatDifferently: z.string().max(2000).optional(),
    /** Storage keys of pre-uploaded, scanned chart attachments. */
    attachmentKeys: z.array(z.string().min(1)).max(8).optional(),
    isDraft: z.boolean().default(false),
  })
  .refine((t) => t.entry !== t.stopLoss, {
    message: 'entry and stopLoss must differ',
    path: ['stopLoss'],
  });
export type CreateTradeRequest = z.infer<typeof CreateTradeRequestSchema>;

/** Response for `POST /journal/trades`. */
export const CreateTradeResponseSchema = z.object({
  trade: TradeSchema,
});
export type CreateTradeResponse = z.infer<typeof CreateTradeResponseSchema>;
