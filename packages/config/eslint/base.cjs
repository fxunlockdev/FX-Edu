/**
 * @fxunlock/config — shared ESLint flat-config preset.
 *
 * Framework-light base used by every package/app. Consumers import this array
 * and spread it into their own `eslint.config.js`, appending surface-specific
 * rules (React, Next, Nest) on top. Kept dependency-free here so the config
 * package stays installable without the full ESLint plugin estate; the actual
 * plugins are declared by the consuming package.
 *
 * @example
 *   // eslint.config.js (consumer)
 *   import base from '@fxunlock/config/eslint';
 *   export default [...base, { rules: { 'no-console': 'off' } }];
 *
 * @type {ReadonlyArray<import('eslint').Linter.Config>}
 */
const base = Object.freeze([
  {
    ignores: ['**/dist/**', '**/.next/**', '**/coverage/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.{ts,tsx,js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      // Immutability and safety — aligned with ENGINEERING.md code style.
      'no-var': 'error',
      'prefer-const': 'error',
      'no-param-reassign': ['error', { props: true }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-implicit-coercion': 'warn',

      // Keep functions/files small and explicit.
      'max-lines': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 4],
      complexity: ['warn', 12],

      // No silent error swallowing, no debug noise in shipped code.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
    },
  },
  {
    // Tests may be longer and noisier.
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**'],
    rules: {
      'max-lines': 'off',
      'no-console': 'off',
    },
  },
]);

module.exports = base;
module.exports.base = base;
module.exports.default = base;
