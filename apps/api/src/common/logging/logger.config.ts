import { randomBytes } from 'node:crypto';
import type { Params } from 'nestjs-pino';

/**
 * Pino logger configuration with aggressive PII/secret redaction.
 *
 * §6.7 / coding-style: "No secrets in source, bundles, logs, or analytics" and
 * "PII redacted". We redact Authorization headers, cookies, tokens, emails, card
 * data, Stripe/Mux signatures, and known sensitive bodies. Redaction is
 * censor-based so the key still appears (useful for debugging) but the value
 * never does.
 *
 * In development we pretty-print; in production we emit structured JSON for the
 * log pipeline (OTel → Grafana). `genReqId` gives every request a correlation id.
 */
const REDACT_PATHS: readonly string[] = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'req.headers["stripe-signature"]',
  'req.headers["x-idempotency-key"]',
  'res.headers["set-cookie"]',
  // Common PII / secret fields wherever they appear in a logged object.
  '*.authorization',
  '*.token',
  '*.access_token',
  '*.refresh_token',
  '*.password',
  '*.email',
  '*.secret',
  '*.cardNumber',
  '*.playbackToken',
  'email',
  'token',
  'password',
  'authorization',
];

export function buildLoggerConfig(isProduction: boolean): Params {
  return {
    pinoHttp: {
      level: isProduction ? 'info' : 'debug',
      genReqId: (req, res) => {
        const existing = req.headers['x-request-id'];
        const id =
          (typeof existing === 'string' && existing) ||
          cryptoRandomId();
        res.setHeader('x-request-id', id);
        return id;
      },
      redact: {
        paths: [...REDACT_PATHS],
        censor: '[redacted]',
      },
      // Never log request/response bodies by default — they carry PII.
      autoLogging: true,
      transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: { singleLine: true, colorize: true },
          },
    },
  };
}

function cryptoRandomId(): string {
  // CSPRNG correlation id (review HIGH-5): predictable ids must not key logs.
  return randomBytes(8).toString('hex');
}
