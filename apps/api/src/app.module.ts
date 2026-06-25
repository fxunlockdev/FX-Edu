import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { buildLoggerConfig } from './common/logging/logger.config';
import { AuthSecurityModule } from './common/auth/auth-security.module';
import { AuditModule } from './common/audit/audit.module';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { RolesGuard } from './common/auth/roles.guard';
import { AuditInterceptor } from './common/audit/audit.interceptor';

import { DbModule } from './modules/db/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { EntitlementsModule } from './modules/entitlements/entitlements.module';
import { MediaModule } from './modules/media/media.module';
import { BillingModule } from './modules/billing/billing.module';

/**
 * Root module.
 *
 * Global guards run in registration order: authenticate first (JwtAuthGuard,
 * which honours @Public), then authorize by role (RolesGuard). Entitlement
 * checks are applied per-route via @RequireEntitlement + EntitlementGuard inside
 * the modules that own gated resources. The AuditInterceptor records every
 * mutating request. The logger (with redaction) and exception filter are wired in
 * main.ts so they wrap the whole request lifecycle.
 */
@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildLoggerConfig(config.isProduction),
    }),
    AuthSecurityModule,
    AuditModule,
    DbModule,
    AuthModule,
    HealthModule,
    EntitlementsModule,
    MediaModule,
    BillingModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
