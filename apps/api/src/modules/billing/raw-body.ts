import type { FastifyInstance, FastifyRequest } from 'fastify';

/** Property under which the captured raw body buffer is stashed. */
export const RAW_BODY_KEY = 'fxRawBody' as const;

export interface RequestWithRawBody {
  [RAW_BODY_KEY]?: Buffer;
}

/** Route whose raw body must be preserved for Stripe signature verification. */
const WEBHOOK_PATH = '/stripe/webhook';

/**
 * Registers a JSON content-type parser that ALSO retains the raw buffer for the
 * Stripe webhook route.
 *
 * Stripe signature verification must run over the exact bytes Stripe sent — a
 * re-serialized JSON object will not verify. For every other route we parse JSON
 * normally; only the webhook keeps the raw body, so we never hold request bodies
 * in memory unnecessarily.
 */
export function registerRawBodyParser(app: FastifyInstance): void {
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (request: FastifyRequest & RequestWithRawBody, body: Buffer, done) => {
      if (request.url.startsWith(WEBHOOK_PATH)) {
        request[RAW_BODY_KEY] = body;
      }
      try {
        const json = body.length > 0 ? JSON.parse(body.toString('utf8')) : {};
        done(null, json);
      } catch (error) {
        done(error as Error, undefined);
      }
    },
  );
}
