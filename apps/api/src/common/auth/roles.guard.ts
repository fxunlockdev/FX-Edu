import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { ROLES_KEY } from './roles.decorator';
import {
  AUTH_CONTEXT_KEY,
  type Role,
  type RequestWithAuth,
} from './auth-context';

/**
 * Authorizes a request against the @Roles(...) metadata on the handler/class.
 *
 * Runs after JwtAuthGuard, so an AuthContext is present. Routes with no @Roles
 * metadata are allowed (any authenticated user); routes with metadata require
 * the JWT role to be in the allowed set. Server-side authorization always.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & RequestWithAuth>();
    const auth = request[AUTH_CONTEXT_KEY];

    if (!auth) {
      throw new UnauthorizedException('No authenticated user on request.');
    }
    if (!required.includes(auth.role)) {
      throw new ForbiddenException('Insufficient role for this resource.');
    }
    return true;
  }
}
