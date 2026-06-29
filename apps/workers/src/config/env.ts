import { z } from "zod";

/**
 * Environment schema for the FX Academy background workers (M15).
 *
 * Validated once at startup; the process FAILS FAST if anything is missing or
 * malformed (ENGINEERING.md: "config via env, validated with a Zod env schema",
 * "fail fast with clear error messages"). No secret ever has a default value.
 *
 * Mirrors the core API's env pattern (apps/api/src/config/env.schema.ts):
 * a single Zod object, parsed once, exposed as a frozen typed accessor.
 *
 * Email: Resend (PROJECT.md §2). In non-production the worker may fall back to
 * the LogMailer when RESEND_API_KEY is absent; production REFUSES to start
 * without a real key + verified from-address (see resolveMailer + the refine).
 */
export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    /** Postgres connection string — feeds the outbox consumer (@fxunlock/db). */
    DATABASE_URL: z.string().url(),

    /** Postgres-backed queue runtime (Graphile Worker / pgmq) connection. */
    REDIS_URL: z.string().url(),

    /** Resend API key. Secret — never hardcoded. Optional only in dev/test. */
    RESEND_API_KEY: z.string().min(1).optional(),

    /** Verified sending address, e.g. "FX Academy <no-reply@mail.fxunlock.com>". */
    RESEND_FROM: z.string().min(3).optional(),
  })
  .refine(
    (env) =>
      env.NODE_ENV !== "production" ||
      (Boolean(env.RESEND_API_KEY) && Boolean(env.RESEND_FROM)),
    {
      message:
        "Production requires RESEND_API_KEY and RESEND_FROM (the LogMailer dev fallback is refused in production).",
      path: ["RESEND_API_KEY"],
    },
  );

export type Env = Readonly<z.infer<typeof envSchema>>;

/**
 * Parse and freeze the process environment. Throws a single, readable error
 * listing every problem so misconfiguration is caught at boot, not mid-job.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `[@fxunlock/workers] Invalid environment configuration:\n${issues}`,
    );
  }
  return Object.freeze(parsed.data);
}
