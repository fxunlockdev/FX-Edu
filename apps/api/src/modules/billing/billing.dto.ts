import { z } from 'zod';

/**
 * Portal session request. `returnUrl` is validated as a URL at the boundary.
 * The Stripe customer id is NEVER accepted from the client — it is resolved
 * server-side from the authenticated user (review CRITICAL-1; see BillingService).
 */
export const portalSessionSchema = z.object({
  returnUrl: z.string().url(),
});

export type PortalSessionDto = z.infer<typeof portalSessionSchema>;
