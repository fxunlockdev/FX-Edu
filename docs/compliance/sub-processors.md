# FX Academy — Sub-Processor List

> Status: **pre-filled from the stack** · Last updated: 2026-06-23
> Published version backs the Privacy Policy. EU-only posture: every processor that touches personal data is pinned to an EU region; unavoidable US providers run under a **DPA + SCCs / EU–US Data Privacy Framework**. Not legal advice — confirm with counsel before publishing.

| Sub-processor | Purpose | Personal data categories | Hosting region | Transfer mechanism |
|---|---|---|---|---|
| **Supabase** | Primary DB, **Auth**, Storage, Realtime | Account, profile, auth credentials, learning progress, journal, community content | **EU — Stockholm (eu-north-1)** | Within EU (DPA) |
| **Stripe** (Payments Europe, Ireland) | Subscriptions, billing, Connect payouts, tax | Name, email, billing address, payment metadata (no card data stored by us) | EU + US | DPA + DPF/SCCs |
| **Mux** | Live + VOD video hosting/streaming | IP address, viewing/session data | US (EU storage option) | DPA + DPF/SCCs |
| **Resend** | Transactional + lifecycle email | Name, email | US | DPA + DPF/SCCs |
| **PostHog** | Product analytics (consent-gated) | Pseudonymous behavioral events, anonymized IP | **EU Cloud** | Within EU (DPA) |
| **Sentry** | Error monitoring | Limited PII in traces (server-side scrubbed) | **EU region** | Within EU (DPA) |
| **Upstash** | Redis cache / rate-limit (transient) | Session/cache keys, transient identifiers | **EU region** | Within EU (DPA) |
| **AI provider** (Anthropic / OpenAI) | AI tutor inference | Conversation text (PII-redacted pre-call) | **EU endpoint / Amazon Bedrock EU (Frankfurt)** | Within EU, or DPA + DPF/SCCs; zero-retention tier |
| **Railway** | **Web + API + worker** compute | Personal data in transit during processing | **EU region** | DPA (+ SCCs if applicable) |
| **Cloudflare** | DNS / WAF / CDN | IP address | EU/global edge | DPA |
| **Doppler** | Secrets management | App secrets only — **no end-user PII** | US | DPA + DPF/SCCs |
| **Polygon.io** | Forex/crypto market data | **No personal data** | US | N/A |
| **Trading Economics** | Economic calendar / macro data | **No personal data** | — | N/A |
| **Zitadel** *(only if enterprise SSO adopted)* | Dedicated IdP for white-label SSO | Auth identifiers for partner SSO | **EU / Switzerland** | Within EU / CH adequacy |

## Notes
- **EU-only stance:** the web app is self-hosted on **Railway-EU** (no Vercel). Mux is US-incorporated but runs in EU regions under DPF/SCCs; if a *zero-US-sub-processor* posture is required, the strict swap is **Cloudflare Stream-EU** (replacing Mux). Cloudflare (edge/CDN/WAF) processes only IP/request metadata. Current recommendation: keep Mux under DPF — revisit only if a customer/regulator demands it.
- Card data is never stored by FX Academy — it stays within Stripe (PCI scope).
- AI conversations are **PII-redacted before** leaving our systems and inference is kept in-EU (Bedrock EU) where possible.
