import Stripe from 'stripe';
import { ConfigService } from '../../config/config.service';

export const STRIPE_CLIENT = 'FX_STRIPE_CLIENT';

/**
 * Provides a single configured Stripe client. The secret key comes only from
 * validated config (never hardcoded). A pinned API version keeps webhook + portal
 * behaviour deterministic across deploys.
 */
export const stripeProvider = {
  provide: STRIPE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Stripe =>
    new Stripe(config.stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    }),
};
