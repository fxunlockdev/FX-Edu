import { Controller, Get } from '@nestjs/common';
import { EntitlementsService } from './entitlements.service';
import type { EntitlementDecision, FeatureKey } from './entitlement.types';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { AuthContext } from '../../common/auth/auth-context';

/** The full feature set surfaced to clients so the UI can render lock states. */
const ALL_FEATURES: readonly FeatureKey[] = [
  'course.entry',
  'course.beginner',
  'course.intermediate',
  'course.advanced',
  'course.psychology',
  'webinars.live',
  'webinars.replays',
  'ai.tutor',
  'analytics',
  'community',
  'trade_ideas',
  'prop_firm',
];

interface EntitlementsResponse {
  readonly userId: string;
  readonly orgId: string;
  readonly entitlements: readonly EntitlementDecision[];
}

/**
 * GET /entitlements — the caller's per-feature decisions.
 *
 * Authenticated (global JwtAuthGuard). The client uses these only to render
 * locked vs unlocked UI; every protected resource is re-checked server-side, so
 * a tampered response grants nothing.
 */
@Controller('entitlements')
export class EntitlementsController {
  constructor(private readonly entitlements: EntitlementsService) {}

  @Get()
  async list(@CurrentUser() user: AuthContext): Promise<EntitlementsResponse> {
    const entitlements = await this.entitlements.decideMany(user, ALL_FEATURES);
    return { userId: user.sub, orgId: user.orgId, entitlements };
  }
}
