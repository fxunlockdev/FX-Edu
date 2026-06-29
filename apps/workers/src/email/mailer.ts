import type { Logger } from "pino";
import { Resend } from "resend";

import type { Env } from "../config/env.js";

/**
 * Mailer abstraction.
 *
 * A stable interface behind which the real provider (Resend) and a dev fallback
 * (LogMailer) live, so the dispatcher never depends on a concrete SDK
 * (PROJECT.md §2 "no rewrites on the path to scale" — providers sit behind
 * stable interfaces). Returns a result object; callers decide retry vs. ack.
 */
export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
}

export interface SendResult {
  readonly ok: boolean;
  /** Provider message id when sent. */
  readonly id?: string;
  /** User-safe error description when send failed. */
  readonly error?: string;
}

export interface Mailer {
  readonly kind: "resend" | "log";
  send(message: EmailMessage): Promise<SendResult>;
}

/* ── ResendMailer (production / staging) ────────────────────────────── */

export class ResendMailer implements Mailer {
  public readonly kind = "resend" as const;

  constructor(
    private readonly client: Resend,
    private readonly from: string,
    private readonly logger: Logger,
  ) {}

  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const { data, error } = await this.client.emails.send({
        from: this.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
      if (error) {
        this.logger.warn({ err: error.message }, "resend.send.failed");
        return { ok: false, error: error.message };
      }
      return { ok: true, id: data?.id };
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      this.logger.error({ err: reason }, "resend.send.threw");
      return { ok: false, error: reason };
    }
  }
}

/* ── LogMailer (dev/test fallback — never in production) ────────────── */

export class LogMailer implements Mailer {
  public readonly kind = "log" as const;

  constructor(private readonly logger: Logger) {}

  async send(message: EmailMessage): Promise<SendResult> {
    // Subject + recipient only; the body is not logged (may contain PII).
    this.logger.info(
      { to: message.to, subject: message.subject },
      "logmailer.send (dev fallback — no email actually sent)",
    );
    return { ok: true, id: `log-${Date.now()}` };
  }
}

/* ── factory + production guard ─────────────────────────────────────── */

/**
 * Resolve the mailer for the current environment.
 *
 * - With RESEND_API_KEY + RESEND_FROM → real ResendMailer.
 * - Without them in dev/test → LogMailer fallback (no real send).
 * - In production without a key → THROW. The LogMailer must never silently
 *   swallow lifecycle email in production (the env refine also blocks this at
 *   boot; this is defence in depth).
 */
export function resolveMailer(env: Env, logger: Logger): Mailer {
  const isProduction = env.NODE_ENV === "production";

  if (env.RESEND_API_KEY && env.RESEND_FROM) {
    return new ResendMailer(
      new Resend(env.RESEND_API_KEY),
      env.RESEND_FROM,
      logger,
    );
  }

  if (isProduction) {
    throw new Error(
      "[@fxunlock/workers] Refusing to start: production requires RESEND_API_KEY + RESEND_FROM (LogMailer is dev-only).",
    );
  }

  logger.warn(
    "RESEND_API_KEY not set — using LogMailer (dev fallback). No real emails will be sent.",
  );
  return new LogMailer(logger);
}
