import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { buildHelmetOptions } from './common/security/helmet.config';
import { GlobalZodValidationPipe } from './common/validation/global-zod-validation.pipe';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { registerRawBodyParser } from './modules/billing/raw-body';

/**
 * Bootstrap the FX Academy core API on Fastify.
 *
 * Wiring order matters:
 *  1. Raw-body parser BEFORE routing so Stripe webhook signature can verify.
 *  2. Helmet (strict CSP/HSTS/nosniff/referrer) at the edge.
 *  3. nestjs-pino as the app logger (PII/secret redaction in logger.config).
 *  4. Global Zod validation pipe + global exception filter (no leakage).
 * The app then listens on the validated PORT.
 */
async function bootstrap(): Promise<void> {
  const adapter = new FastifyAdapter({
    // Trust Railway's proxy so request.ip is the real client (audit + rate limit).
    trustProxy: true,
    bodyLimit: 1_048_576, // 1 MiB — generous for JSON, bounded against abuse.
  });

  // Capture the raw body for Stripe signature verification before Nest parses it.
  registerRawBodyParser(adapter.getInstance());

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { bufferLogs: true },
  );

  const config = app.get(ConfigService);

  // Use the redacting Pino logger for all app logging.
  app.useLogger(app.get(PinoLogger));

  // Security headers.
  await app.register(helmet, buildHelmetOptions(config.isProduction));

  // Validate every boundary; never leak internals on error.
  app.useGlobalPipes(new GlobalZodValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Graceful shutdown for Railway deploys/rollbacks.
  app.enableShutdownHooks();

  await app.listen({ port: config.port, host: '0.0.0.0' });
}

void bootstrap();
