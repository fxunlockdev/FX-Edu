import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import {
  MAX_TOKEN_TTL_SECONDS,
  type MediaTokenSigner,
  type PlaybackToken,
  type PlaybackTokenRequest,
} from './media-token.types';

/**
 * Stub Mux playback-token signer.
 *
 * Real Mux signed playback uses the signing key id + RS256 private key to mint a
 * JWT (aud "v", sub = playbackId, exp) — see Mux docs. We keep the exact shape
 * (clamped short TTL, per-asset, per-user) so swapping in the real signature is a
 * one-method change. The placeholder token is NOT a valid playback credential.
 *
 * TODO: wire Mux signing — sign an RS256 JWT with MUX_SIGNING_KEY_ID (kid) and
 * MUX_SIGNING_PRIVATE_KEY over { aud:'v', sub: playbackId, exp }, optionally with
 * a per-session watermark claim (§6.4 dynamic watermark).
 */
@Injectable()
export class MuxTokenSigner implements MediaTokenSigner {
  constructor(private readonly config: ConfigService) {}

  async sign(request: PlaybackTokenRequest): Promise<PlaybackToken> {
    const ttl = Math.min(
      Math.max(request.ttlSeconds, 1),
      MAX_TOKEN_TTL_SECONDS,
    );
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

    // Reference the signing key id only (never the private key) so it is clear
    // which credential will sign once wired. No secret is placed in the token.
    const keyId = this.config.muxSigningKeyId;

    return {
      token: `stub.${keyId}.${request.playbackId}.${request.userId}.${ttl}`,
      playbackId: request.playbackId,
      expiresAt,
    };
  }
}
