import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'fx:isPublic';

/**
 * Marks a route as not requiring a verified session JWT.
 *
 * Use sparingly: `GET /health` (liveness) and `POST /stripe/webhook` (which
 * authenticates via Stripe signature, not a user session). Everything else is
 * authenticated by default — fail closed.
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
