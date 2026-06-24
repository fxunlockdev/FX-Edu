import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { EntitlementsService } from './entitlements.service';
import { ENTITLEMENT_KEY } from './require-entitlement.decorator';
import type { FeatureKey } from './entitlement.types';
import {
  AUTH_CONTEXT_KEY,
  type RequestWithAuth,
} from '../../common/auth/auth-context';

/**
 * Enforces @RequireEntitlement(feature) at the route boundary.
 *
 * Runs after authentication, loads the caller's subscription, and refuses the
 * request unless the pure decider returns `allow`. A `locked` outcome is a 403
 * the client renders as a designed upgrade state. This is the API policy layer;
 * Postgres RLS enforces row scope independently (§6.1 two-layer authorization).
 */
@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlements: EntitlementsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<FeatureKey | undefined>(
      ENTITLEMENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!feature) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & RequestWithAuth>();
    const auth = request[AUTH_CONTEXT_KEY];
    if (!auth) {
      throw new UnauthorizedException('No authenticated user on request.');
    }

    const decision = await this.entitlements.decideFor(auth, feature);
    if (decision.outcome === 'allow') {
      return true;
    }

    throw new ForbiddenException({
      message: 'This feature requires an upgraded plan.',
      feature: decision.feature,
      outcome: decision.outcome,
      reason: decision.reason,
    });
  }
}
