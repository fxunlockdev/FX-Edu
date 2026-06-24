import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { JwtVerifier } from './jwt-verifier';
import { AUTH_CONTEXT_KEY, type RequestWithAuth } from './auth-context';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Global authentication guard.
 *
 * Verifies the Supabase Auth bearer token on every request and attaches the
 * resulting AuthContext to the request. Routes decorated with @Public() (health,
 * Stripe webhook — which authenticates by signature instead) are skipped.
 *
 * This is authentication only. Authorization (role + entitlement) is enforced by
 * RolesGuard / EntitlementGuard, and independently by Postgres RLS.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly verifier: JwtVerifier,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & RequestWithAuth>();

    const token = this.extractBearer(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    const auth = await this.verifier.verify(token);
    request[AUTH_CONTEXT_KEY] = auth;
    return true;
  }

  private extractBearer(header?: string): string | undefined {
    if (!header) {
      return undefined;
    }
    const [scheme, value] = header.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !value) {
      return undefined;
    }
    return value.trim();
  }
}
