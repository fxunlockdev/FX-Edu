/**
 * Boundary for minting short-TTL signed playback tokens (§6.4).
 *
 * A token is minted ONLY after a server-side entitlement check passes, is scoped
 * per-user + per-asset, and expires quickly. The concrete signer is Mux; this
 * interface keeps the controller provider-agnostic (Mux → IVS is a swap, §12).
 */
export interface PlaybackTokenRequest {
  readonly playbackId: string;
  readonly userId: string;
  /** Time-to-live in seconds; the signer clamps this to a safe maximum. */
  readonly ttlSeconds: number;
}

export interface PlaybackToken {
  readonly token: string;
  readonly playbackId: string;
  readonly expiresAt: string;
}

export interface MediaTokenSigner {
  sign(request: PlaybackTokenRequest): Promise<PlaybackToken>;
}

export const MEDIA_TOKEN_SIGNER = 'FX_MEDIA_TOKEN_SIGNER';

/** Default and maximum playback token lifetime (short-lived per §6.4). */
export const DEFAULT_TOKEN_TTL_SECONDS = 60;
export const MAX_TOKEN_TTL_SECONDS = 300;
