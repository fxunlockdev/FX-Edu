import path from 'node:path';

// Supabase origin for CSP connect-src. The browser auth/realtime client calls
// the project URL directly (HTTPS + WSS), so it must be allow-listed or the
// session/login requests are blocked. Derived from the public env at build time
// (falls back to the *.supabase.co wildcard if the URL is absent during build).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
let supabaseConnect = 'https://*.supabase.co wss://*.supabase.co';
try {
  if (supabaseUrl) {
    const { host } = new URL(supabaseUrl);
    supabaseConnect = `https://${host} wss://${host}`;
  }
} catch {
  // Keep the wildcard fallback on a malformed URL.
}

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
      `connect-src 'self' ${supabaseConnect}`,
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
  // @fxunlock/ui and @fxunlock/trading ship TypeScript source; let Next transpile
  // them in the app build (no separate compile step in the workspace packages).
  transpilePackages: ['@fxunlock/ui', '@fxunlock/trading', '@fxunlock/entitlements'],
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
