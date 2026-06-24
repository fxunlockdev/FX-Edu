import { Global, Module } from '@nestjs/common';
import { JwtVerifier } from './jwt-verifier';

/**
 * Exposes JWT verification machinery to guards across the app. Guards
 * themselves are registered globally via APP_GUARD in AppModule; this module
 * just makes JwtVerifier injectable everywhere.
 */
@Global()
@Module({
  providers: [JwtVerifier],
  exports: [JwtVerifier],
})
export class AuthSecurityModule {}
