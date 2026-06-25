import { Controller, Get } from '@nestjs/common';
import { ALL_FEATURE_KEYS } from '@fxunlock/entitlements';
import { EntitlementsService } from './entitlements.service';
import type { EntitlementDecision } from './entitlement.types';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { AuthContext } from '../../common/auth/auth-context';

interface EntitlementsResponse {
  readonly userId: string;
  readonly orgId: string;
  readonly entitlements: readonly EntitlementDecision[];
}

/**
 * GET /entitlements — the caller's per-feature decisions.
 *
 * The feature surface comes from `@fxunlock/entitlements` (`ALL_FEATURE_KEYS`),
 * the single source of truth — there is no second list to drift (resolves review
 * CRITICAL-4 + HIGH-2). Authenticated (global JwtAuthGuard). The client uses
 * these only to render locked vs unlocked UI; every protected resource is
 * re-checked server-side, so a tampered response grants nothing.
 */
@Controller('entitlements')
export class EntitlementsController {
  constructor(private readonly entitlements: EntitlementsService) {}

  @Get()
  async list(@CurrentUser() user: AuthContext): Promise<EntitlementsResponse> {
    const entitlements = await this.entitlements.decideMany(
      user,
      ALL_FEATURE_KEYS,
    );
    return { userId: user.sub, orgId: user.orgId, entitlements };
  }
}
