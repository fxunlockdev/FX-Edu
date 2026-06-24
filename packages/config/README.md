# @fxunlock/config

Shared presets for the FX Academy monorepo: build/lint config and a
Zod-validated environment helper. No I/O, no side effects on import.

## Exports

| Import | What you get |
| --- | --- |
| `@fxunlock/config` | `createEnv`, `envPrimitives`, `EnvValidationError`, types |
| `@fxunlock/config/env` | same as above (explicit subpath) |
| `@fxunlock/config/eslint` | shared ESLint flat-config preset (array) |
| `@fxunlock/config/tsconfig/base.json` | base TS compiler options |
| `@fxunlock/config/tsconfig/library.json` | base + `noEmit` for libraries |

## Env helper

Validate `process.env` at startup. Fails fast with a readable error that
**redacts values** — only keys and the validation issue are printed, never the
secret itself.

```ts
import { z } from 'zod';
import { createEnv, envPrimitives } from '@fxunlock/config';

const Env = z.object({
  NODE_ENV: envPrimitives.nodeEnv(),
  DATABASE_URL: envPrimitives.url(),
  PORT: envPrimitives.port(3000),
  STRIPE_SECRET_KEY: envPrimitives.string(),
  ENABLE_AI_TUTOR: envPrimitives.boolean(false),
});

// Throws EnvValidationError (value-redacted) if anything is missing/invalid.
export const env = createEnv(Env, { context: 'api' });
```

Pass `source` to keep tests deterministic:

```ts
const env = createEnv(Env, { source: { NODE_ENV: 'test', /* ... */ } });
```

## tsconfig preset

```jsonc
// packages/<x>/tsconfig.json
{
  "extends": "@fxunlock/config/tsconfig/library.json",
  "include": ["src"]
}
```

## ESLint preset

```js
// eslint.config.js
import base from '@fxunlock/config/eslint';
export default [...base, { rules: { 'no-console': 'off' } }];
```

The base is framework-light; the consuming package declares any React/Next/Nest
plugins it adds on top.
