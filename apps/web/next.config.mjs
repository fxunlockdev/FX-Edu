import path from 'node:path';

// Security headers (review MEDIUM-7). CSP intentionally allows 'unsafe-inline'
// for script/style today because the Next.js App Router injects inline bootstrap
// scripts; TODO(security): harden to a nonce-based CSP via middleware. Cloudflare
// may also enforce a subset of these at the edge.
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "form-action 'self' https://checkout.stripe.com",
    ].join('; '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway deploys the Next.js Node server as a self-contained bundle.
  output: 'standalone',
  // Pin the monorepo root so Next stops mis-detecting a stray parent lockfile.
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  reactStrictMode: true,
  poweredByHeader: false,
  // @fxunlock/ui ships TypeScript source; let Next transpile it in the app build.
  transpilePackages: ['@fxunlock/ui'],
  // Linting runs as its own workspace task (`pnpm lint`), not inside the
  // production build, so a missing/locked ESLint config never blocks builds.
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
