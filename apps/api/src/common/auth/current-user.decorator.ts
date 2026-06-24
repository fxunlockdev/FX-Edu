import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import {
  AUTH_CONTEXT_KEY,
  type AuthContext,
  type RequestWithAuth,
} from './auth-context';

/**
 * Injects the verified AuthContext into a handler parameter.
 *
 * Presence is guaranteed by JwtAuthGuard for non-@Public routes; if it is ever
 * absent the request was misrouted past authentication, so we fail closed rather
 * than hand back a partial/undefined principal.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext => {
    const request = ctx
      .switchToHttp()
      .getRequest<FastifyRequest & RequestWithAuth>();
    const auth = request[AUTH_CONTEXT_KEY];
    if (!auth) {
      throw new UnauthorizedException('No authenticated user on request.');
    }
    return auth;
  },
);
