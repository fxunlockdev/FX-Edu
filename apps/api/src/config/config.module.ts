import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { loadEnv } from './load-env';
import type { Env } from './env.schema';

export const ENV_TOKEN = 'FX_ENV';

/**
 * Global config module. Validates the environment at module construction and
 * exposes a typed, frozen ConfigService everywhere. Marked @Global so feature
 * modules never re-import it.
 */
@Global()
@Module({
  providers: [
    { provide: ENV_TOKEN, useFactory: (): Env => loadEnv() },
    {
      provide: ConfigService,
      inject: [ENV_TOKEN],
      useFactory: (env: Env) => new ConfigService(env),
    },
  ],
  exports: [ConfigService, ENV_TOKEN],
})
export class ConfigModule {}
