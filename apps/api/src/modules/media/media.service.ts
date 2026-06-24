import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntitlementsService } from '../entitlements/entitlements.service';
import type { Plan } from '../entitlements/entitlement.types';
import {
  DEFAULT_TOKEN_TTL_SECONDS,
  MEDIA_TOKEN_SIGNER,
  type MediaTokenSigner,
  type PlaybackToken,
} from './media-token.types';
import type { AuthContext } from '../../common/auth/auth-context';

/** A lesson's playable asset + the plan tier required to watch it. */
interface LessonMedia {
  readonly playbackId: string;
  readonly requiredTier: Plan;
}

/**
 * Mints a playback token for a lesson — but only after an entitlement check.
 *
 * Flow (PROJECT.md §6.4, F5): resolve lesson → asset + required tier, run the
 * server-side entitlement decision, and ONLY on `allow` ask the signer for a
 * short-TTL token. Deny/locked → 403, no token ever minted.
 */
@Injectable()
export class MediaService {
  constructor(
    private readonly entitlements: EntitlementsService,
    @Inject(MEDIA_TOKEN_SIGNER)
    private readonly signer: MediaTokenSigner,
  ) {}

  async mintLessonPlaybackToken(
    auth: AuthContext,
    lessonId: string,
  ): Promise<PlaybackToken> {
    const media = await this.resolveLessonMedia(lessonId);

    const decision = await this.entitlements.decideFor(
      auth,
      'lesson.playback',
      media.requiredTier,
    );

    if (decision.outcome !== 'allow') {
      // Deny media to the unentitled — the core anti-piracy gate.
      throw new ForbiddenException({
        message: 'Not entitled to play this lesson.',
        feature: decision.feature,
        outcome: decision.outcome,
        reason: decision.reason,
      });
    }

    return this.signer.sign({
      playbackId: media.playbackId,
      userId: auth.sub,
      ttlSeconds: DEFAULT_TOKEN_TTL_SECONDS,
    });
  }

  /**
   * Resolve a lesson to its media asset + required tier.
   *
   * TODO: wire @fxunlock/db — read `lessons` + `lesson_assets` (Mux playbackId,
   * signed-playback metadata) scoped by org_id via RLS. Until then we reject all
   * lookups so no token can be minted for an unknown/unverified asset.
   */
  private async resolveLessonMedia(lessonId: string): Promise<LessonMedia> {
    if (!lessonId) {
      throw new NotFoundException('Lesson not found.');
    }
    throw new NotFoundException('Lesson media not available yet.');
  }
}
