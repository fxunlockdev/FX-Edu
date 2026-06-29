import { createDb } from "@fxunlock/db";

import { loadEnv } from "./config/env.js";
import { resolveMailer } from "./email/mailer.js";
import { createDispatcher } from "./notifications/dispatcher.js";
import { createNotificationStore } from "./notifications/store.js";
import { createLogger } from "./observability/logger.js";
import { runWorker } from "./queue/worker.js";

/**
 * FX Academy lifecycle-messaging worker bootstrap (M15).
 *
 * Boot order: validate env (fail-fast) → logger → db client → mailer (refuses
 * LogMailer in production) → store → dispatcher → runWorker. A single
 * AbortController drives graceful shutdown so an in-flight batch finishes before
 * the process exits.
 */
async function main(): Promise<void> {
  const env = loadEnv();
  const logger = createLogger(env.NODE_ENV);

  const db = createDb({ connectionString: env.DATABASE_URL });
  const mailer = resolveMailer(env, logger);
  const store = createNotificationStore(db);
  const dispatcher = createDispatcher({ store, mailer, logger });

  const controller = new AbortController();
  const shutdown = (sig: string) => {
    logger.info({ sig }, "worker.shutdown_requested");
    controller.abort();
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));

  logger.info({ mailer: mailer.kind, env: env.NODE_ENV }, "worker.boot");

  await runWorker(
    { db, dispatcher, logger },
    { signal: controller.signal },
  );

  logger.info("worker.exit");
}

main().catch((error: unknown) => {
  // Boot-time failure (bad env, missing Resend key in prod) — exit non-zero so
  // the orchestrator (Railway) restarts/visibly fails. No secrets in the message.
  const reason = error instanceof Error ? error.message : "Unknown error";
  // eslint-disable-next-line no-console -- logger may not be constructed yet
  console.error(`[@fxunlock/workers] fatal: ${reason}`);
  process.exitCode = 1;
});
