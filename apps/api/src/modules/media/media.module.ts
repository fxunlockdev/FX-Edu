import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MuxTokenSigner } from './mux-token-signer';
import { MEDIA_TOKEN_SIGNER } from './media-token.types';
import { EntitlementsModule } from '../entitlements/entitlements.module';

/**
 * Media module. Binds the Mux signer behind its DI token and depends on
 * EntitlementsModule so playback is always entitlement-gated before minting.
 */
@Module({
  imports: [EntitlementsModule],
  controllers: [MediaController],
  providers: [
    MediaService,
    { provide: MEDIA_TOKEN_SIGNER, useClass: MuxTokenSigner },
  ],
})
export class MediaModule {}
