import { Controller, Get, Param } from '@nestjs/common';
import { z } from 'zod';
import { MediaService } from './media.service';
import type { PlaybackToken } from './media-token.types';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { AuthContext } from '../../common/auth/auth-context';

/** Lesson ids are UUIDs; validate at the boundary before any lookup. */
const lessonIdSchema = z.string().uuid('lesson id must be a UUID');

/**
 * GET /lessons/:id/playback-token — mint a short-TTL signed playback token.
 *
 * Authenticated. The service runs an entitlement check before minting, so an
 * unentitled caller receives 403 and no token. The token is single-asset,
 * single-user, and expires within seconds (§6.4).
 */
@Controller('lessons')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get(':id/playback-token')
  async playbackToken(
    @CurrentUser() user: AuthContext,
    @Param('id', new ZodValidationPipe(lessonIdSchema)) lessonId: string,
  ): Promise<PlaybackToken> {
    return this.media.mintLessonPlaybackToken(user, lessonId);
  }
}
