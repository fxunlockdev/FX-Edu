import { z } from 'zod';

/**
 * Environment schema for the FX Academy core API.
 *
 * Validated once at startup; the process FAILS FAST if anything is missing or
 * malformed (ENGINEERING.md: "config via env, validated with a Zod env schema",
 * "fail fast with clear error messages"). No secret ever has a default value.
 *
 * Identity: Supabase Auth (EU). We verify the session JWT either via a JWKS URL
 * (asymmetric, preferred) or a shared secret (HS256). Exactly one must be set.
 */
export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    PORT: z.coerce.number().int().positive().max(65535).default(3001),

    // Database (Supabase Postgres, EU/Frankfurt). Consumed once @fxunlock/db wires in.
    DATABASE_URL: z.string().url(),

    // Supabase Auth — JWT verification. Provide JWKS (preferred) OR a shared secret.
    SUPABASE_PROJECT_URL: z.string().url(),
    SUPABASE_JWKS_URL: z.string().url().optional(),
    // HS256 needs >= 256 bits of entropy; Supabase JWT secrets are 64+ chars.
    SUPABASE_JWT_SECRET: z.string().min(32).optional(),

    // Stripe — billing webhooks + portal. Secrets, never hardcoded.
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    // Upstash Redis — entitlement cache, rate limits, webhook idempotency.
    REDIS_URL: z.string().url(),

    // Mux — short-TTL signed media playback tokens.
    MUX_SIGNING_KEY_ID: z.string().min(1),
    MUX_SIGNING_PRIVATE_KEY: z.string().min(1),
  })
  .refine(
    (env) => Boolean(env.SUPABASE_JWKS_URL) || Boolean(env.SUPABASE_JWT_SECRET),
    {
      message:
        'Provide SUPABASE_JWKS_URL (preferred) or SUPABASE_JWT_SECRET to verify Supabase Auth JWTs.',
      path: ['SUPABASE_JWKS_URL'],
    },
  );

export type Env = z.infer<typeof envSchema>;
