import { envSchema, type Env } from './env.schema';

/**
 * Parse and validate process.env exactly once, at startup.
 *
 * On failure we print every offending key and exit non-zero — the app must not
 * boot in a half-configured state (ENGINEERING.md: "validate that required
 * secrets are present at startup", "fail fast"). We deliberately log only the
 * key paths and messages, never the values, so secrets never reach the logs.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    // Intentionally to stderr (pre-logger bootstrap) and value-free.
    process.stderr.write(
      `\n[config] Invalid environment configuration:\n${issues}\n\n`,
    );
    process.exit(1);
  }

  return Object.freeze(parsed.data);
}
