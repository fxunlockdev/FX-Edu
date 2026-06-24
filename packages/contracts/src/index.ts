/**
 * @fxunlock/contracts — shared Zod schemas + inferred types.
 *
 * The single source of truth for request/response shapes across `apps/api`,
 * `apps/web`, and `packages/sdk`. Validate at every boundary; never trust
 * external data (ENGINEERING.md). Organized by domain; this barrel re-exports
 * everything.
 *
 * Covers the PRD §11 critical APIs:
 *   /me · /entitlements · /dashboard · /courses · /courses/:id ·
 *   /lessons/:id/playback-token · /lessons/:id/progress · /lessons/:id/complete ·
 *   /quiz-attempts · /checkout/session · /billing/portal-session · /webinars ·
 *   /webinars/:id/register · /journal/trades (GET/POST) · /analytics ·
 *   /community/* (channels, posts, reports)
 */

// Cross-cutting: response envelope + shared primitives.
export * from './envelope.js';
export * from './common.js';

// Domains.
export * from './identity.js';
export * from './dashboard.js';
export * from './courses.js';
export * from './billing.js';
export * from './webinars.js';
export * from './journal.js';
export * from './analytics.js';
export * from './community.js';
