/**
 * @fxunlock/workers — public surface (M15 lifecycle messaging).
 *
 * Importing this module is side-effect free (no env load, no DB connect, no
 * polling). The runtime entry is `src/main.ts`. This barrel exposes the units
 * that other packages/tests may reuse: the worker loop, the dispatcher, the
 * preference logic, the templates, and the event taxonomy.
 */
export { loadEnv, type Env } from "./config/env.js";
export { runWorker, processEvent, type WorkerDeps } from "./queue/worker.js";
export {
  claimDueEvents,
  markPublished,
  markFailed,
  markSkipped,
  reclaimStaleProcessing,
  MAX_ATTEMPTS,
} from "./queue/outbox.js";
export {
  createDispatcher,
  type Dispatcher,
  type ResolvedNotification,
  type DispatchResult,
} from "./notifications/dispatcher.js";
export {
  isChannelEnabled,
  resolveChannels,
  mayEmail,
  mayNotifyInApp,
  type Channel,
  type PreferenceRow,
} from "./notifications/preferences.js";
export {
  createNotificationStore,
  type NotificationStore,
  type NotificationType,
  type InAppPayload,
} from "./notifications/store.js";
export {
  resolveMailer,
  ResendMailer,
  LogMailer,
  type Mailer,
  type EmailMessage,
  type SendResult,
} from "./email/mailer.js";
export * from "./email/templates/index.js";
export { HANDLERS, getHandler, type EventHandler } from "./handlers/index.js";
export {
  EVENT_SCHEMAS,
  isHandledEventType,
  type HandledEventType,
  type OutboxEvent,
} from "./events/types.js";
