import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';
import { ConfigService } from '../../config/config.service';
import { isRole, type AuthContext } from './auth-context';

/**
 * Verifies Supabase Auth session JWTs and maps validated claims to an
 * immutable AuthContext.
 *
 * Two verification modes, chosen at startup by which env var is present:
 *  - JWKS (asymmetric, preferred): keys fetched + cached from SUPABASE_JWKS_URL.
 *  - Shared secret (HS256): SUPABASE_JWT_SECRET.
 *
 * We never trust the token's payload shape — `org_id` and `role` are validated
 * before an AuthContext is produced (ENGINEERING.md: never trust external data).
 */
@Injectable()
export class JwtVerifier {
  private readonly jwks?: JWTVerifyGetKey;
  private readonly secret?: Uint8Array;
  private readonly issuer: string;
  private static readonly AUDIENCE = 'authenticated';

  constructor(private readonly config: ConfigService) {
    const jwksUrl = this.config.supabaseJwksUrl;
    const sharedSecret = this.config.supabaseJwtSecret;
    // Supabase Auth `iss` is `<project-url>/auth/v1`; pin it so a token minted
    // by a different issuer sharing the key set cannot be replayed here.
    this.issuer = `${this.config.supabaseProjectUrl.replace(/\/+$/, '')}/auth/v1`;

    if (jwksUrl) {
      this.jwks = createRemoteJWKSet(new URL(jwksUrl));
    } else if (sharedSecret) {
      this.secret = new TextEncoder().encode(sharedSecret);
    }
    // load-env already guarantees at least one is set; no else branch needed.
  }

  async verify(token: string): Promise<AuthContext> {
    const payload = await this.verifySignature(token);
    return this.toAuthContext(payload, token);
  }

  private async verifySignature(token: string): Promise<JWTPayload> {
    try {
      if (this.jwks) {
        const { payload } = await jwtVerify(token, this.jwks, {
          issuer: this.issuer,
          audience: JwtVerifier.AUDIENCE,
          algorithms: ['RS256', 'ES256'],
        });
        return payload;
      }
      if (this.secret) {
        const { payload } = await jwtVerify(token, this.secret, {
          issuer: this.issuer,
          audience: JwtVerifier.AUDIENCE,
          algorithms: ['HS256'],
        });
        return payload;
      }
      throw new Error('no_verification_material');
    } catch {
      // Deliberately opaque: never leak verification internals to the caller.
      throw new UnauthorizedException('Invalid or expired session token.');
    }
  }

  private toAuthContext(payload: JWTPayload, token: string): AuthContext {
    const sub = payload.sub;
    const orgId = payload['org_id'];
    const role = payload['role'];
    const email = payload['email'];

    if (typeof sub !== 'string' || sub.length === 0) {
      throw new UnauthorizedException('Session token is missing a subject.');
    }
    if (typeof orgId !== 'string' || orgId.length === 0) {
      throw new UnauthorizedException('Session token is missing org context.');
    }
    if (!isRole(role)) {
      throw new UnauthorizedException('Session token has no recognised role.');
    }

    return Object.freeze({
      sub,
      orgId,
      role,
      email: typeof email === 'string' ? email : undefined,
      token,
    });
  }
}
