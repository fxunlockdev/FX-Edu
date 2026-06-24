import { z } from 'zod';

/**
 * Environment validation helper.
 *
 * Validates a raw environment record against a Zod schema at process startup,
 * failing fast with a readable, **value-redacted** error. Secret values are
 * never echoed back — only the offending keys and the validation issue are
 * reported, satisfying the "no secrets in logs" rule (ENGINEERING.md §security).
 */

/** A Zod object schema describing the required environment shape. */
export type EnvSchema = z.ZodObject<z.ZodRawShape>;

/** The validated, typed env object inferred from the schema. */
export type InferEnv<TSchema extends EnvSchema> = z.infer<TSchema>;

/** A source of raw env values (defaults to `process.env`). */
export type EnvSource = Readonly<Record<string, string | undefined>>;

/** Options for {@link createEnv}. */
export interface CreateEnvOptions {
  /**
   * Raw values to validate. Defaults to `process.env`.
   * Pass an explicit record in tests to keep them deterministic.
   */
  readonly source?: EnvSource;
  /**
   * Label used in error messages (e.g. "api", "web"). Helps locate which
   * service failed to boot in aggregated logs.
   */
  readonly context?: string;
}

/** Error thrown when environment validation fails. Carries redacted issues only. */
export class EnvValidationError extends Error {
  readonly issues: readonly string[];

  constructor(context: string | undefined, issues: readonly string[]) {
    const where = context ? ` for "${context}"` : '';
    super(
      `Invalid environment${where}. Fix the following before starting:\n` +
        issues.map((issue) => `  - ${issue}`).join('\n'),
    );
    this.name = 'EnvValidationError';
    this.issues = issues;
  }
}

/**
 * Convert a Zod error into redacted, human-readable lines.
 * Reports the key path and message but NEVER the attempted value.
 */
const toRedactedIssues = (error: z.ZodError): readonly string[] =>
  error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
    return `${path}: ${issue.message}`;
  });

/**
 * Validate the environment against `schema` and return a typed, immutable env.
 *
 * Throws {@link EnvValidationError} (value-redacted) when validation fails, so
 * services crash loudly at boot instead of mis-running with bad config.
 *
 * @example
 *   const Env = z.object({ DATABASE_URL: z.string().url() });
 *   export const env = createEnv(Env, { context: 'api' });
 */
export function createEnv<TSchema extends EnvSchema>(
  schema: TSchema,
  options: CreateEnvOptions = {},
): Readonly<InferEnv<TSchema>> {
  const source = options.source ?? (process.env as EnvSource);
  const result = schema.safeParse(source);

  if (!result.success) {
    throw new EnvValidationError(options.context, toRedactedIssues(result.error));
  }

  return Object.freeze(result.data) as Readonly<InferEnv<TSchema>>;
}

/**
 * Reusable Zod primitives for common env shapes. Pure, composable building
 * blocks consumers can mix into their own schemas.
 */
export const envPrimitives = Object.freeze({
  /** Required non-empty string. */
  string: () => z.string().min(1),
  /** Required URL string. */
  url: () => z.string().url(),
  /** Port number coerced from string, 1–65535. */
  port: (fallback?: number) => {
    const base = z.coerce.number().int().min(1).max(65535);
    return fallback === undefined ? base : base.default(fallback);
  },
  /** Boolean parsed from "true"/"1"/"yes" (case-insensitive). */
  boolean: (fallback = false) =>
    z
      .string()
      .optional()
      .transform((value) => {
        if (value === undefined) return fallback;
        return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
      }),
  /** One of the standard deploy stages. */
  nodeEnv: () => z.enum(['development', 'test', 'preview', 'staging', 'production']),
});
