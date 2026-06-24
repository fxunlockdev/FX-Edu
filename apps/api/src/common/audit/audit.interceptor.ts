import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  AUDIT_SERVICE,
  type AuditRecord,
  type AuditService,
} from './audit.types';
import {
  AUTH_CONTEXT_KEY,
  type AuthContext,
  type RequestWithAuth,
} from '../auth/auth-context';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Records an audit entry for every mutating request (§6.7: "every admin
 * mutation writes an audit log"). Read-only requests are skipped.
 *
 * Fires after the handler resolves so the response status is known. Audit
 * persistence is best-effort relative to the response: a sink failure is
 * swallowed (and surfaced by the sink's own logging) so it can never take down a
 * succeeding mutation. The durable @fxunlock/db wiring will make this
 * transactional via the outbox.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @Inject(AUDIT_SERVICE) private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & RequestWithAuth>();

    if (!MUTATING_METHODS.has(request.method)) {
      return next.handle();
    }

    const reply = context.switchToHttp().getResponse<FastifyReply>();
    const auth = request[AUTH_CONTEXT_KEY];

    // Audit BOTH outcomes (review MEDIUM-1): a denied/failed mutation (e.g. an
    // unauthorized billing probe) must be recorded, not only successes.
    return next.handle().pipe(
      tap({
        next: () => this.write(request, auth, reply.statusCode),
        error: (err: unknown) =>
          this.write(request, auth, this.errorStatus(err)),
      }),
    );
  }

  private write(
    request: FastifyRequest,
    auth: AuthContext | undefined,
    statusCode: number,
  ): void {
    const entry: AuditRecord = {
      actorId: auth?.sub ?? null,
      orgId: auth?.orgId ?? null,
      action: `${request.method} ${this.routePattern(request)}`,
      target: request.url,
      method: request.method,
      path: request.url,
      statusCode,
      ip: request.ip ?? null,
      userAgent: this.headerValue(request.headers['user-agent']),
      timestamp: new Date().toISOString(),
    };
    void this.audit.record(entry).catch(() => undefined);
  }

  private errorStatus(err: unknown): number {
    return err instanceof HttpException ? err.getStatus() : 500;
  }

  private headerValue(value: string | string[] | undefined): string | null {
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }
    return value ?? null;
  }

  /**
   * Resolve the matched route pattern (e.g. `/lessons/:id/playback-token`) so
   * the audit action does not embed volatile path params. Tolerant of Fastify
   * version differences (`routeOptions.url` vs `routerPath`); falls back to the
   * concrete url.
   */
  private routePattern(request: FastifyRequest): string {
    const anyReq = request as unknown as {
      routeOptions?: { url?: string };
      routerPath?: string;
    };
    return anyReq.routeOptions?.url ?? anyReq.routerPath ?? request.url;
  }
}
