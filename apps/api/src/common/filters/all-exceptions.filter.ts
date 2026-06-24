import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

interface ErrorBody {
  readonly statusCode: number;
  readonly error: string;
  readonly message: string;
  readonly details?: unknown;
  readonly requestId?: string;
  readonly timestamp: string;
}

/**
 * Global exception filter — the single place errors become HTTP responses.
 *
 * Known HttpExceptions pass through their status + sanitised body. Anything
 * unexpected becomes an opaque 500: the real error is logged server-side with
 * full context, but the client only sees a generic message (ENGINEERING.md:
 * "user-friendly messages in UI, detailed context server-side"; §6: error
 * messages must not leak internals).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const { status, error, message, details } = this.normalize(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        {
          err: exception,
          method: request.method,
          url: request.url,
          requestId: request.id,
        },
        'Unhandled exception',
      );
    }

    const body: ErrorBody = {
      statusCode: status,
      error,
      message,
      ...(details !== undefined ? { details } : {}),
      requestId: typeof request.id === 'string' ? request.id : undefined,
      timestamp: new Date().toISOString(),
    };

    void reply.status(status).send(body);
  }

  private normalize(exception: unknown): {
    status: number;
    error: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return { status, error: exception.name, message: response };
      }
      const obj = response as Record<string, unknown>;
      const message =
        typeof obj['message'] === 'string'
          ? obj['message']
          : exception.message;
      const details = obj['errors'] ?? undefined;
      return { status, error: exception.name, message, details };
    }

    // Unknown — never surface the real cause to the client.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalServerError',
      message: 'An unexpected error occurred.',
    };
  }
}
