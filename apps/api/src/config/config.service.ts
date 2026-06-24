import { Injectable } from '@nestjs/common';
import type { Env } from './env.schema';

/**
 * Typed, read-only accessor over the validated environment.
 *
 * The raw env is parsed once (see loadEnv) and injected as a frozen object, so
 * config is immutable for the lifetime of the process. Handlers never touch
 * process.env directly — they depend on this service.
 */
@Injectable()
export class ConfigService {
  constructor(private readonly env: Env) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.env.NODE_ENV;
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  get port(): number {
    return this.env.PORT;
  }

  get databaseUrl(): string {
    return this.env.DATABASE_URL;
  }

  get supabaseProjectUrl(): string {
    return this.env.SUPABASE_PROJECT_URL;
  }

  get supabaseJwksUrl(): string | undefined {
    return this.env.SUPABASE_JWKS_URL;
  }

  get supabaseJwtSecret(): string | undefined {
    return this.env.SUPABASE_JWT_SECRET;
  }

  get stripeSecretKey(): string {
    return this.env.STRIPE_SECRET_KEY;
  }

  get stripeWebhookSecret(): string {
    return this.env.STRIPE_WEBHOOK_SECRET;
  }

  get redisUrl(): string {
    return this.env.REDIS_URL;
  }

  get muxSigningKeyId(): string {
    return this.env.MUX_SIGNING_KEY_ID;
  }

  get muxSigningPrivateKey(): string {
    return this.env.MUX_SIGNING_PRIVATE_KEY;
  }
}
