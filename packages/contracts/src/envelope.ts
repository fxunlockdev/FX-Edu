import { z } from 'zod';

/**
 * Standard API response envelope (PROJECT.md / common patterns).
 *
 * Every API response uses `{ ok, data, error, meta? }`. On success `ok: true`,
 * `data` holds the payload, `error` is null. On failure `ok: false`, `data` is
 * null, `error` describes the problem. `meta` carries cursor pagination for
 * list responses.
 */

/** Machine-readable error shape — safe to surface; carries no secrets. */
export const ApiErrorSchema = z.object({
  /** Stable, screaming-snake error code (e.g. ENTITLEMENT_DENIED). */
  code: z.string().min(1),
  /** Human-readable, user-safe message. */
  message: z.string().min(1),
  /** Optional field-level validation issues (path → message). */
  details: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

/** Cursor pagination metadata for list responses. */
export const CursorPaginationMetaSchema = z.object({
  /** Opaque cursor to fetch the next page; null when no more pages. */
  nextCursor: z.string().nullable(),
  /** Whether another page exists after this one. */
  hasMore: z.boolean(),
  /** Page size used for this response. */
  limit: z.number().int().positive(),
  /** Total count when cheaply known; omitted otherwise. */
  total: z.number().int().nonnegative().optional(),
});
export type CursorPaginationMeta = z.infer<typeof CursorPaginationMetaSchema>;

/**
 * Build a success-envelope schema around a data schema.
 * `meta` is optional and present mainly on list endpoints.
 */
export const successEnvelope = <TData extends z.ZodTypeAny>(data: TData) =>
  z.object({
    ok: z.literal(true),
    data,
    error: z.null(),
    meta: CursorPaginationMetaSchema.optional(),
  });

/** The error envelope is constant across endpoints. */
export const ErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  data: z.null(),
  error: ApiErrorSchema,
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

/**
 * Full envelope schema (success | error) for a given data schema. Use this to
 * validate a response whose success/failure is not yet known.
 */
export const apiEnvelope = <TData extends z.ZodTypeAny>(data: TData) =>
  z.discriminatedUnion('ok', [successEnvelope(data), ErrorEnvelopeSchema]);

/**
 * Cursor pagination *request* params shared by every list endpoint.
 * `limit` is bounded to protect the DB (no unbounded queries).
 */
export const CursorPaginationParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type CursorPaginationParams = z.infer<typeof CursorPaginationParamsSchema>;

/** Generic helper type for a fully-typed success envelope payload. */
export type ApiSuccess<TData> = {
  ok: true;
  data: TData;
  error: null;
  meta?: CursorPaginationMeta;
};

/** Generic helper type for the response union. */
export type ApiResponse<TData> = ApiSuccess<TData> | ErrorEnvelope;
