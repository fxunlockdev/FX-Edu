import { pino, type Logger } from "pino";

/**
 * Structured logger for the workers process.
 *
 * Pino, matching the API's logging choice (apps/api uses pino/nestjs-pino).
 * Pretty transport only outside production; production emits JSON for the log
 * pipeline. No PII is logged here — handlers log ids, not email bodies.
 */
export function createLogger(nodeEnv: string): Logger {
  const isProduction = nodeEnv === "production";
  return pino({
    level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
    base: { service: "fxunlock-workers" },
    redact: {
      paths: ["payload.email", "*.email", "to", "*.to"],
      censor: "[redacted]",
    },
    ...(isProduction
      ? {}
      : { transport: { target: "pino-pretty", options: { colorize: true } } }),
  });
}

export type { Logger };
