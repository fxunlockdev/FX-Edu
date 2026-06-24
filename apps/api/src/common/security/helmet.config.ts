import type { FastifyHelmetOptions } from '@fastify/helmet';

/**
 * Strict security headers for the API (§6.6 / web/security.md).
 *
 * This service is a JSON API with no first-party HTML, so the CSP is locked to
 * `'self'` with `default-src 'none'` and all framing/object embedding disabled.
 * HSTS is preloadable; nosniff and a strict referrer policy are on. Adjust origins
 * only when a concrete cross-origin need (e.g. Stripe.js) is proven, and never
 * loosen to `'unsafe-inline'` scripts.
 */
export function buildHelmetOptions(
  isProduction: boolean,
): FastifyHelmetOptions {
  return {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        'default-src': ["'none'"],
        'base-uri': ["'self'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        'connect-src': ["'self'"],
        'object-src': ["'none'"],
        'img-src': ["'self'", 'data:'],
        ...(isProduction
          ? { 'upgrade-insecure-requests': [] }
          : {}),
      },
    },
    // HSTS: 1 year, include subdomains, preloadable.
    hsts: {
      maxAge: 31_536_000,
      includeSubDomains: true,
      preload: true,
    },
    // X-Content-Type-Options: nosniff
    noSniff: true,
    // Referrer-Policy: strict-origin-when-cross-origin
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // X-Frame-Options: DENY (belt-and-suspenders with frame-ancestors).
    frameguard: { action: 'deny' },
    // Lock down powerful browser features for any HTML this origin might serve.
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    // No need to advertise the framework.
    hidePoweredBy: true,
  };
}
