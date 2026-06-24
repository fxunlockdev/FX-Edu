import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

/**
 * Auth surface module. Serves GET /me. Token verification itself lives in the
 * global AuthSecurityModule + JwtAuthGuard, so this module only exposes the
 * read-back of the authenticated context.
 */
@Module({
  controllers: [AuthController],
})
export class AuthModule {}
