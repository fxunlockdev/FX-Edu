/**
 * @fxunlock/config — shared presets for FX Academy.
 *
 * Exports:
 *  - `createEnv` + `envPrimitives` — Zod-validated, value-redacted env helper.
 *  - `@fxunlock/config/eslint` — shared ESLint flat-config preset (subpath).
 *  - `@fxunlock/config/tsconfig/*` — shared tsconfig presets (subpath JSON).
 */
export {
  createEnv,
  EnvValidationError,
  envPrimitives,
  type CreateEnvOptions,
  type EnvSchema,
  type EnvSource,
  type InferEnv,
} from './env.js';
