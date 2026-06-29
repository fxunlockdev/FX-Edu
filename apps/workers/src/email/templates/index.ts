/**
 * Email template surface (PRD §8.16 notification types).
 *
 * Every template is a pure function `props → { subject, html, text }`.
 */
export type { RenderedEmail } from "./layout.js";
export * from "./engagement.js";
export * from "./transactional.js";
