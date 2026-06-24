# FX Academy Product Requirements Document

Date: 2026-06-22
Source design package: `/Users/viloljoshi/Downloads/Design-main.zip`
Repository reference: `Viloljoshi/Design.git`

## 1. Product Summary

FX Academy is an education-first forex learning platform that combines structured courses, live webinars, course-aware AI tutoring, trading tools, journaling, performance analytics, community accountability, certificates, affiliate referrals, and white-label partner academies.

The product must feel like a disciplined trading operating system, not a signal room. The central promise is: learn a repeatable process, practice it, journal it, review it, and improve safely with guardrails.

The platform must be built security-first because it will handle identity, payments, subscription entitlements, private learning history, user-generated community content, AI conversations, financial-risk preferences, certificates, affiliate payouts, and partner tenant data.

## 2. Product Goals

1. Convert visitors into paid members through a clear education-first funnel: homepage, curriculum, pricing, free webinar, tools, signup, checkout, onboarding.
2. Give Basic members a useful foundation: Entry and Beginner courses, video library, journal, risk calculator, certificates for eligible tiers.
3. Make Pro clearly valuable: full curriculum, psychology, live webinars and replays, AI tutor, analytics, community, trade ideas, prop-firm prep.
4. Support live webinars for thousands of concurrent viewers with low-latency playback, recording, replays, chat/Q&A moderation, and entitlement checks.
5. Build a secure multi-tenant platform that can later support partner-branded academies, custom domains, affiliate dashboards, and admin operations.
6. Ensure all trading-related content is educational only. The platform must never present trade ideas, AI answers, testimonials, or tools as financial advice or profit guarantees.

## 3. Non-Goals

1. No brokerage execution or connected live trading in v1.
2. No personalized financial advice, regulated investment recommendations, copy-trading, or paid signal distribution.
3. No custody of user funds beyond subscription payments and affiliate payouts through Stripe.
4. No custom video streaming infrastructure. Use managed video services.
5. No per-partner custom authentication domain in v1 unless sold as Enterprise and isolated in a separate identity tenant.

## 4. Primary Users

### Public Visitor

Discovers FX Academy through SEO, affiliate referrals, free tools, free webinars, or social content. Needs trust, transparent pricing, risk disclaimers, curriculum clarity, and an easy signup path.

### Basic Member

Wants structured foundations, risk tools, and journaling. Should see Pro value through locked modules, locked webinar replays, AI tutor previews, analytics upgrade prompts, and community/prop-firm previews.

### Pro Member

Wants the full loop: advanced curriculum, live webinars, AI tutor, trade journal, analytics, community, trade ideas, strategy library, prop-firm prep, certificates, and notifications.

### Educator

Creates lessons, hosts webinars, publishes trade ideas, moderates community discussion, reviews Q&A, and manages replays/transcripts.

### Admin

Manages members, courses, lessons, webinars, trade ideas, AI knowledge, community moderation, affiliates, revenue, white-label partners, CRM/integrations, security events, and platform settings.

### Affiliate

Promotes FX Academy, manages referral links and campaigns, views conversions/commissions, downloads promo assets, and receives Stripe Connect payouts.

### White-Label Partner

Runs a branded academy with custom domain, logo, colors, course library configuration, members, revenue/licensing visibility, team access, and partner settings.

## 5. Plans And Entitlements

### Basic

Price in design: `$49/mo`, yearly discounted equivalent shown as `$39/mo`.

Included:
- Entry and Beginner courses.
- Video library access for eligible tiers.
- Trade journal.
- Risk calculator.
- Certificates for completed Basic-access tiers.
- Billing, settings, notifications.

Locked or limited:
- Intermediate, Advanced, and Psychology tiers.
- Weekly live webinars and replays.
- AI learning agents.
- Performance analytics.
- Community and accountability pods.
- Trade idea feed.
- Prop firm prep.
- Some strategy playbooks.

### Pro

Price in design: `$97/mo`, yearly discounted equivalent shown as `$78/mo`.

Included:
- Full 5-tier curriculum.
- Trading Psychology.
- Weekly live webinars and replay library.
- AI tutor and lesson-scoped AI panel.
- Performance analytics.
- Community and accountability pods.
- Trade ideas.
- Journal and risk calculator.
- Strategy library.
- Prop firm prep.
- Certificates at every tier.

### Elite

Price in design: from `$147/mo`, coming soon.

Planned:
- Everything in Pro.
- Prop firm prep track.
- Educator Q&A.
- Monthly live coaching calls.
- Early access to content.
- Smaller cohort/high-touch support.

### Entitlement Requirements

- Entitlements must be enforced server-side on every API and media request.
- UI locks are hints only; they are not security controls.
- Entitlement checks must include plan, subscription state, partner tenant, course tier access, webinar registration/access, and media token expiry.
- Subscription state must be webhook-driven from Stripe, with reconciliation jobs for missed events.
- Downgrades preserve raw data, certificates, journal history, and progress, but restrict future access to gated views.

## 6. Recommended Technology And Services

### Core Stack

- Frontend: Next.js + React + TypeScript, App Router, Tailwind/Radix-style component system.
- Web hosting: Vercel Enterprise for the public site and member app shell, using global CDN, preview deployments, deployment protection, WAF/bot controls, and framework-aware Next.js infrastructure.
- Core API: NestJS or Fastify TypeScript service on AWS ECS Fargate behind an Application Load Balancer. Keep sensitive business logic, webhooks, entitlement decisions, admin APIs, and partner operations off the public edge.
- Background processing: AWS SQS + EventBridge + Lambda/ECS workers.
- Database: Amazon Aurora PostgreSQL Serverless v2 with RDS Proxy, Multi-AZ, automated backups, point-in-time recovery, and pgvector for private retrieval indexes.
- Cache/rate limit/session adjunct: Redis via Amazon ElastiCache Serverless or Upstash Redis if staying closer to Vercel for edge rate limits.
- Object storage: Amazon S3 with KMS encryption, private buckets, lifecycle rules, malware scanning on upload, and CloudFront signed URLs/cookies where needed.
- Infrastructure: Terraform with separate dev/stage/prod AWS accounts.

Rationale:
- Next.js matches the existing workspace direction and is excellent for marketing plus authenticated app surfaces.
- Managed AWS services reduce operational risk for streaming, video, queues, storage, secrets, security, and audit trails.
- Aurora Serverless v2 is suitable for variable and multi-tenant workloads because capacity scales with demand.
- A dedicated API service keeps critical security and entitlement logic in one place rather than spreading it across client and edge functions.

### Identity And Access

Use Auth0/Okta Customer Identity for v1.

Required capabilities:
- Universal Login.
- Email/password, Google, Apple.
- MFA with step-up for admin, educator, affiliate payout, and partner admin actions.
- Passkeys/WebAuthn when available.
- Organizations for partner/white-label tenants.
- Role-based access control.
- Branded login experience.
- Auth0 Actions for claims, onboarding status, entitlement mapping, and risk-based login rules.

Important white-label caveat:
- Auth0 Organizations support B2B tenant modeling, roles, organization-specific login prompts, and lightweight branding. However, Auth0 Organizations do not support custom login domains per organization. If a partner requires `login.partnerdomain.com`, provision a separate Auth0 tenant or sell it as an Enterprise isolation feature.

### Payments, Billing, Tax, Affiliates

Use Stripe:
- Stripe Checkout for subscription purchase.
- Stripe Billing for Basic, Pro, Elite, yearly/monthly subscriptions, coupons, invoices, retries, failed payments, and subscription lifecycle.
- Stripe Customer Portal for billing self-service.
- Stripe Tax if operating across taxable jurisdictions.
- Stripe Connect for affiliate payouts and partner revenue share.
- Stripe webhooks as source of truth for subscription and payout state.

### Live Streaming And Video

Use Amazon IVS for live webinars.

Live webinar architecture:
- AWS IVS Low-Latency channels for one-to-many webinars.
- Private IVS channels with signed playback tokens for Pro-only sessions and replays.
- IVS Chat for live Q&A, or a custom moderated chat channel if product needs richer threaded questions.
- Auto-record IVS streams to S3.
- EventBridge listener for stream start, stream end, recording complete, replay processing, transcript generation, and notification triggers.
- Educator broadcast through OBS/RTMPS or Web Broadcast SDK.

VOD lesson architecture:
- Course uploads stored in S3.
- AWS Elemental MediaConvert to generate adaptive HLS renditions, thumbnails, captions, and audio tracks.
- CloudFront signed URLs/cookies for gated video.
- Watermark overlay at player level for anti-sharing deterrence: member ID/email hash, dynamic session watermark for Pro/Elite content.

Why IVS:
- It is managed live-video infrastructure, supports low-latency channels, global viewing, secure ingest protocols, real-time stages, and recording to S3.
- It avoids the failure mode of building or self-scaling WebRTC/HLS infrastructure before product-market fit.

### AI Tutor

Use OpenAI Responses API through a server-side AI gateway.

Architecture:
- Store course content, lesson transcripts, glossary, policy text, and approved examples in Postgres/pgvector or OpenSearch.
- Retrieve relevant course chunks server-side, then call the model with scoped context.
- Keep user profile context minimal: current lesson, tier, plan, and progress. Do not send billing, payout, exact address, or unnecessary PII.
- Use policy prompts plus deterministic classifiers for disallowed financial-advice patterns.
- Use moderation/safety checks before and after generation.
- Log prompts/responses with redaction and retention limits.
- Route all AI through a domain policy: educational explanations, quizzes, summaries, learning suggestions, and journal reflection only.

AI must refuse or redirect:
- Buy/sell instructions.
- Personalized entry/exit recommendations.
- Profit guarantees.
- Trade signals.
- Broker or leverage recommendations tailored to a user.
- Circumvention of prop-firm or broker rules.

Allowed AI:
- Explain curriculum concepts.
- Quiz the learner.
- Summarize current lesson.
- Suggest next lesson based on progress.
- Reflect on journal patterns using the user's own logged data.
- Explain how a public trade idea maps to a lesson, without recommending action.

### Market Data And News

Use a provider abstraction because market data licensing can become expensive and legally sensitive.

Recommended launch providers:
- Massive/Polygon forex and crypto APIs/WebSockets for dashboard prices, snapshots, and historical data.
- Trading Economics for economic calendar and macro event data.

Requirements:
- Product copy must label market prices/news as educational context.
- Data must not be marketed as trading execution-grade.
- Cache data server-side to reduce vendor costs and protect API keys.
- Include provider attribution where license requires.
- Add kill switch if provider limits or license terms are exceeded.

### Community And Real-Time App Events

Recommended:
- Postgres for durable posts, replies, reactions, reports, saved posts, and channel membership.
- Ably or AWS AppSync subscriptions for real-time presence, unread counters, notifications, and lightweight chat events.
- IVS Chat only for live webinar chat/Q&A unless unified chat is preferred.

Moderation:
- Profanity, spam, signal-selling, DM solicitation, fraud, and financial-advice moderation queues.
- Report/flag workflow with admin review.
- Automatic hold for posts containing trade calls framed as recommendations.

### Transactional Messaging

Use:
- Resend or AWS SES for transactional email.
- EventBridge + SQS for notification jobs.
- In-app notifications stored in Postgres.
- Later: push notifications via Firebase Cloud Messaging/APNs for mobile/PWA.

Notification types:
- Webinar reminder.
- New trade idea.
- Community reply.
- Weekly progress digest.
- Product update.
- Certificate earned.
- Failed payment.
- Affiliate payout.
- Partner domain verification.

### Observability And Analytics

Use:
- OpenTelemetry instrumentation.
- Datadog or Grafana Cloud for traces, metrics, logs, dashboards, and alerts.
- Sentry for frontend/backend error reporting.
- Product analytics via PostHog with PII minimization, or self-hosted PostHog if stricter data residency is needed.
- CloudWatch for AWS-native metrics and alarms.

Tracking must not include raw payment data, full AI prompts by default, private journal text, or community private messages.

## 7. Security Requirements

### Security Principles

1. Server-side authorization always.
2. Tenant isolation by default.
3. Least-privilege access for services and staff.
4. Short-lived media and API tokens.
5. No secrets in source, client bundles, logs, or analytics.
6. Every admin action must be auditable.
7. Financial and AI claims must be policy-constrained.

### Identity Security

- Enforce MFA for admins, educators, affiliate payout changes, and partner admins.
- Support optional MFA for members.
- Use step-up auth for billing, payout, password/email changes, partner domain changes, and admin impersonation.
- Use Auth0 RBAC and app-level permissions.
- Include organization/tenant ID and roles in tokens.
- Session lifetime: short for admin, longer refresh for members with risk-based reauthentication.

### Data Security

- Encrypt at rest with AWS KMS.
- Encrypt in transit everywhere.
- Store secrets in AWS Secrets Manager.
- Rotate database credentials and third-party API keys.
- Use RDS Proxy and IAM where practical.
- Use Postgres RLS for tenant-scoped tables or enforce tenant isolation in a shared authorization layer with automated tests.
- Backups encrypted and tested quarterly.

### Application Security

- OWASP ASVS Level 2 target for member app; Level 3 patterns for admin/billing/payout flows.
- CSRF protection for cookie-authenticated endpoints.
- Strict CSP, frame ancestors, HSTS, X-Content-Type-Options, Referrer-Policy.
- Rate limits by IP, user, organization, endpoint, and risk score.
- WAF rules for common attacks, bot traffic, credential stuffing, and suspicious checkout behavior.
- File upload scanning before content is served.
- Signed upload URLs with MIME/type/size validation.
- Dependency scanning, secret scanning, SAST, and DAST in CI.

### Media Security

- Private S3 buckets only.
- Signed playback URLs/tokens with short TTL.
- Entitlement check before every playback grant.
- Dynamic watermark for Pro/Elite video.
- Disable public object listing.
- Abuse monitoring for excessive concurrent streams per account.

### AI Security And Safety

- Redact PII before model calls when possible.
- Use retrieved course content, not open-ended web browsing, for core tutoring.
- Add prompt-injection defenses around lesson transcripts and user uploads.
- Moderation checks for unsafe or policy-violating input/output.
- Human review queue for flagged AI conversations.
- Keep model outputs away from personalized financial recommendations.

### Compliance And Legal

- Stripe handles PCI-sensitive payment data; app must never store card numbers.
- GDPR/CCPA export/delete flows.
- Terms, Privacy Policy, Risk Disclosure, Affiliate Disclosure, AI Disclosure.
- Age gate: require users to confirm they are at least 18 or the applicable age for trading education in their jurisdiction.
- Testimonials must include no profit guarantees.
- Affiliate disclosure prompts and policy enforcement.
- Community rules must ban signal-selling and solicitation.

## 8. Product Requirements By Surface

### 8.1 Public Marketing Site

Design screens:
- Home.
- Curriculum.
- Pricing.
- Webinars landing.
- Trading tools.
- AI learning landing.
- Affiliate landing.
- White-label landing.

Requirements:
- Responsive marketing pages with sticky navigation.
- Hero sections for education-first positioning.
- Referral banner when `?ref=` is present.
- Trust badges: structured curriculum, weekly webinars, built-in journal, AI course support, risk-first education.
- Product mockup with dashboard metrics and AI tutor prompt.
- Problem section explaining scattered learning, no feedback loop, risk afterthought, emotion-driven trading.
- Six-step product loop: learn, attend sessions, ask AI, log trades, review analytics, improve.
- Curriculum preview with five tiers.
- Integrated tools section.
- AI learning section with clear guardrails.
- Weekly webinar section with next session and registration CTA.
- Pricing teaser and testimonials with disclaimers.
- Footer with Terms, Privacy, Risk Disclosure, Affiliate Disclosure.

Acceptance criteria:
- All public pages include financial-risk disclaimer.
- Pricing CTAs preserve referral and selected plan.
- Referral code is validated and sanitized before display.
- Pages pass Lighthouse performance, accessibility, and SEO budgets.

### 8.2 Authentication, Signup, Checkout, Onboarding

Design screens:
- Login.
- Signup.
- Checkout.
- Checkout success.

Requirements:
- Login with email/password, Google, Apple.
- Signup with name, email, password strength meter, terms/risk acknowledgement.
- Existing email error path.
- Checkout has four steps: account, plan, payment, trading profile.
- Plan selection supports Basic and Pro in v1, Elite waitlist.
- Coupon support, including valid, expired, invalid states.
- Secure payment through Stripe Checkout or embedded Checkout. Do not collect raw card data in our app.
- Support 3DS/SCA flows.
- Post-payment profile:
  - Experience level.
  - Main goal.
  - Account size.
  - Risk comfort.
  - Acquisition source.
- Checkout success offers next actions:
  - Start Entry course.
  - Set account size.
  - Watch platform walkthrough.
  - Join next live webinar.

Acceptance criteria:
- Subscription is active only after verified Stripe webhook.
- User cannot access paid content based solely on client redirect.
- Failed payment, declined card, and 3DS flows are handled.
- Onboarding state is recoverable if the browser closes.

### 8.3 Member Dashboard

Design states:
- New user.
- Basic member.
- Pro member.

Requirements:
- Show plan badge, streak, XP, greeting, primary CTA.
- New user checklist:
  - Complete trading profile.
  - Set account size.
  - Start Entry Course.
  - Watch platform walkthrough.
  - Log first practice trade.
  - Register for weekly webinar.
  - Join community pod.
- Recommended first course.
- Continue learning card.
- Today's trading focus.
- Live prices card.
- Market news card with impact indicators.
- Upcoming webinar card.
- Journal snapshot.
- Risk calculator snapshot.
- AI tutor prompts.
- Community pod card.
- Performance insight card.
- Basic users see locked Pro feature cards with upgrade CTAs.

Acceptance criteria:
- Dashboard content is personalized from actual progress, plan, profile, and recent activity.
- Locked cards cannot leak protected content.
- Live price widgets degrade gracefully if data provider is down.

### 8.4 Learning Paths

Design screens:
- Public curriculum.
- Member learning paths.
- Lesson player.

Curriculum tiers:
1. Entry: forex basics, currency pairs, market movement, brokers/spreads/pips, risk basics.
2. Beginner: candlesticks, support/resistance, chart reading, order types, trade planning.
3. Intermediate: strategy building, confluence, sessions, trade management, risk-to-reward.
4. Advanced: institutional concepts, liquidity, market structure, ICT-style concepts, advanced execution.
5. Psychology: discipline, bias, revenge trading, overtrading, journaling mindset.

Requirements:
- Search courses and lessons.
- Filter by difficulty, duration, certificate availability.
- Tabs: All, My Courses, Entry, Beginner, Intermediate, Advanced, Psychology, Completed.
- Course cards include level, lessons/modules count, duration, plan access, progress, lock state.
- Upgrade modal for Basic users accessing Pro courses.
- Lesson player:
  - Adaptive video playback.
  - Resume from last watched position.
  - Play/pause, seek, playback speed, captions, fullscreen.
  - Transcript tab.
  - Lesson notes tab.
  - Mini quiz tab.
  - Bookmark.
  - Download notes.
  - Mark complete.
  - Completion modal with XP, mini quiz CTA, journal note CTA, next lesson CTA.
- Course progress updates only after server acknowledgement.

Acceptance criteria:
- Course unlocks are entitlement-checked server-side.
- Watch progress is stored at least every 15 seconds and on pause/exit.
- Completion requires minimum watch progress and/or quiz depending on course rules.
- Certificate progress is not client-forgeable.

### 8.5 AI Tutor

Design screens:
- AI learning landing.
- AI tutor page.
- Lesson-scoped AI panel.

Modes:
- Explain.
- Quiz me.
- What's next.
- Review a trade.

Requirements:
- AI tutor is Pro-only.
- AI is course-aware and tied to current tier/lesson.
- Suggested prompts:
  - Explain liquidity.
  - Quiz me on order types.
  - What should I study next?
  - Explain fair value gap.
  - Review my last trade.
- Lesson panel must be scoped to the current lesson.
- AI must display disclaimer: educational content only, not financial advice.
- AI can cite course lesson/source snippets where helpful.
- AI should refuse signal/guarantee/personalized trading advice.
- Admins can manage AI knowledge base content.
- AI responses and flags are visible in admin safety review.

Acceptance criteria:
- AI cannot answer with direct buy/sell/enter/exit recommendations.
- AI answers must remain grounded in retrieved course content for curriculum topics.
- AI logs are redacted and retention-limited.
- User can delete AI conversation history.

### 8.6 Live Webinars And Replays

Design screens:
- Public webinars landing.
- Member webinars.
- Dashboard webinar card.

Session types:
- Technical analysis.
- Fundamental analysis.
- Mindset/trading psychology.

Requirements:
- Public free webinar registration: name and email.
- Member schedule with countdown to next live session.
- Reserve seat and add to calendar.
- Join live button when session is live and user is entitled.
- Pro replay library with topic filter.
- Replays include recording, transcript, AI summary, host, duration, and topic.
- Educators can create sessions:
  - Title.
  - Description.
  - Host.
  - Topic.
  - Date/time/timezone.
  - Access level: Free, Pro, Elite, Partner tenant.
  - Registration cap if needed.
  - Recording enabled.
  - Chat/Q&A enabled.
- Webinar reminders: immediate confirmation, 24h, 1h, 30m.
- Live chat/Q&A moderation:
  - Slow mode.
  - Blocked terms.
  - Report user.
  - Mute/ban.
  - Educator pin question.

Scale target:
- v1 production must support 5,000 concurrent live viewers.
- Architecture should scale to 25,000 concurrent viewers without redesign by using IVS.

Acceptance criteria:
- A Pro-only live stream cannot be joined by Basic or expired users.
- Recording is automatically attached to replay library after processing.
- If recording processing fails, admin receives alert and can retry.
- Chat moderation actions are audited.

### 8.7 Trading Tools And Risk Calculator

Design screens:
- Public trading tools.
- Member risk calculator.
- Trade-new live risk preview.

Tools:
- Position Size Calculator.
- Risk/Reward Planner.
- Pip Value Calculator.
- Profit & Loss Simulator.
- Correlation Checker.
- Session Clock.
- Prop Firm Risk mode.

Requirements:
- Calculator inputs:
  - Account size.
  - Account currency.
  - Risk percent.
  - Risk amount.
  - Pair/instrument.
  - Direction.
  - Entry.
  - Stop loss.
  - Take profit.
- Outputs:
  - Suggested lot size.
  - Risk amount.
  - Stop distance.
  - Potential reward.
  - Reward:risk.
  - Pip value.
  - Warnings for tight stops, >2% risk, prop firm cap violations.
- Save calculation to journal as draft/new trade.
- Public version can be free but must drive membership CTA.

Acceptance criteria:
- Calculations are deterministic, unit-tested, and instrument-aware.
- Warnings are displayed before save if risk exceeds user preference.
- Tool copy includes slippage/spread/execution disclaimer.

### 8.8 Trade Journal And Trade Logging

Design screens:
- Trade journal.
- Log trade.

Requirements:
- Journal summary:
  - Trades this week.
  - Win rate.
  - Avg R:R.
  - Net R last 30 days.
  - Best pair.
  - Average emotion score.
- Recent trades table:
  - Pair.
  - Direction.
  - Setup.
  - Session.
  - Result.
  - R multiple.
- Filters:
  - Pair.
  - Result.
  - Session.
  - Setup.
  - Date range.
- Log trade form:
  - Pair/instrument.
  - Direction.
  - Setup/strategy.
  - Session.
  - Entry.
  - Stop loss.
  - Take profit.
  - Result: Open, Win, Loss, Breakeven.
  - Emotional state 1-10.
  - Thesis.
  - What would you do differently?
  - Attach chart screenshots.
  - Save as draft or completed.
- Live position sizing preview while logging.
- AI reflection card for Pro.

Acceptance criteria:
- Journal remains accessible after downgrade, but Pro analytics are locked.
- R multiple and win/loss calculations are recomputed server-side.
- User can export journal CSV and request data deletion.

### 8.9 Performance Analytics

Design screen:
- Performance Analytics.

Requirements:
- Pro-only.
- Summary metrics:
  - Win rate.
  - Avg R.
  - Net R.
  - Avg risk.
  - Trades analyzed.
  - Consistency grade.
- Charts:
  - Net R over time.
  - Win rate by session.
  - Win rate by day of week.
  - Average R by setup.
  - R multiple by pair.
- AI insights:
  - Best session.
  - Loss clusters.
  - Best setup.
  - Behavioral leak detection, e.g. Friday underperformance.
- Date range selection.

Acceptance criteria:
- Analytics exclude open trades unless explicitly selected.
- Charts update after trade save.
- AI insight generation must not recommend live trades.

### 8.10 Trade Ideas, Market News, Live Prices

Design screen:
- Trade Ideas.

Requirements:
- Pro-only unless a public/free teaser is explicitly configured.
- Educator-published ideas.
- Required disclaimer: educational examples, not signals or financial advice.
- Idea fields:
  - Educator.
  - Timestamp.
  - Pair/instrument.
  - Bias: long, short, neutral.
  - Timeframe.
  - Analysis note.
  - Educational entry area.
  - Invalidation.
  - Objective.
  - Strategy tag.
  - Related lesson/playbook.
  - Attach chart image.
- Filters:
  - Pair.
  - Timeframe.
  - Educator.
  - Tag.
- Actions:
  - Save.
  - Discuss.
  - Open related strategy.
- Dashboard news:
  - High/medium/low impact.
  - Source.
  - Asset tag.
  - Time since publication.
- Dashboard prices:
  - EUR/USD, GBP/USD, USD/JPY, XAU/USD, BTC/USD, AUD/USD in prototype.
  - Sparkline and percent change.

Acceptance criteria:
- Admin/educator must acknowledge disclosure before publishing an idea.
- Trade ideas cannot trigger push notifications with signal-like copy.
- Provider data is cached and attributed per license.

### 8.11 Community And Pods

Design screen:
- Community.

Requirements:
- Pro-only in v1.
- Channels:
  - General.
  - Technical analysis.
  - Fundamentals.
  - Psychology.
  - Journaling.
  - Wins and lessons.
  - Prop firm prep.
- Composer for posts with text and chart/image upload.
- Posts include author, channel, timestamp, body, reactions, replies, save action.
- Online members list.
- Community rules:
  - Educational discussion only.
  - No signal-selling or DM solicitation.
  - Share reasoning, not just calls.
  - Be respectful.
- Pods:
  - Accountability pod of 6-10 traders.
  - Weekly goals and check-ins.
  - Unread counts.
  - Admin assignment and member self-join rules.
- Moderation:
  - Report post/comment/user.
  - Admin queue.
  - Mute/ban.
  - Auto-hold suspicious solicitation.

Acceptance criteria:
- Basic members cannot read Pro community content through direct URLs.
- All moderation actions are logged.
- Deleted posts are soft-deleted for audit retention.

### 8.12 Strategy Library

Design screen:
- Strategy Library.

Strategies in design:
- Breakout Retest.
- Liquidity Sweep Reversal.
- Trend Pullback.
- Range Rotation.
- Session Open Drive.
- Fair Value Gap Fill.

Requirements:
- Filter by All, Technical, Smart Money, Trend, Range.
- Strategy cards include category, difficulty, lessons count, description, lock state.
- Playbooks contain:
  - Concept.
  - Rules.
  - Setup criteria.
  - Invalidation.
  - Risk notes.
  - Examples.
  - Related lessons.
  - Quiz/checklist.
- Basic users see locked Pro strategies.

Acceptance criteria:
- Playbooks use educational language only.
- Strategy completion can contribute to course/certificate progress if configured.

### 8.13 Prop Firm Prep

Design screen:
- Prop Firm Prep.

Requirements:
- Pro-only.
- Readiness score.
- Prep path:
  1. Understand rulebook.
  2. Build compliant routine.
  3. Simulate evaluation.
  4. Manage funded phase.
- Evaluation-day checklist:
  - Risk per trade fixed at 1% or less.
  - Daily loss limit set as hard stop.
  - No trading during high-impact news.
  - Trade plan written before market open.
  - Journal updated after every trade.
- Prop firm constraints:
  - Max daily drawdown.
  - Max overall drawdown.
  - Profit target.
  - Per-trade cap.
  - Evaluation start/end dates.
- Integrate with risk calculator and journal.

Acceptance criteria:
- Platform must not claim it guarantees passing evaluations.
- Prop rules are user-configurable and not treated as official firm data unless sourced/licensed.

### 8.14 Certificates

Design screen:
- Certificates.

Requirements:
- Certificates earned by completing eligible tiers.
- Summary:
  - Certificates earned.
  - Overall course progress.
  - Tiers remaining.
- Certificate states:
  - Earned.
  - In progress.
  - Locked.
- Earned certificates include:
  - Student name.
  - Tier.
  - Course/certificate name.
  - Issue date.
  - Verification ID.
  - Public verification URL.
  - Download PDF.
  - Share link.
- Certificates recognize education, not trading results.

Acceptance criteria:
- Verification URLs reveal only certificate validity and minimal learner identity.
- Certificates cannot be minted from client-side completion events alone.

### 8.15 Billing

Design screen:
- Billing.

Requirements:
- Current plan card.
- Price, billing interval, renewal date.
- Switch to yearly.
- Manage plan via Stripe Customer Portal.
- Billing history table with receipt downloads.
- Payment method summary.
- Update card.
- Plan includes list.
- Cancel subscription.
- Failed payment state.
- Upgrade/downgrade flows from pricing.

Acceptance criteria:
- Billing changes are reflected only after Stripe webhook confirmation.
- Cancel flow retains access until period end unless immediate cancellation is requested.
- Payment method is managed by Stripe; no card data stored locally.

### 8.16 Notifications And Settings

Design screens:
- Notifications.
- Settings.

Notifications:
- Tabs: All, Webinars, Community, Progress.
- Unread count.
- Mark all read.
- Read on click.
- Notification types:
  - Webinar starting soon.
  - New trade idea.
  - Community reply.
  - Certificate progress.
  - Post reactions.
  - Weekly recap.

Settings:
- Profile:
  - Photo.
  - Full name.
  - Display name.
  - Email.
  - Country.
  - Bio.
- Notification toggles:
  - Live webinar reminders.
  - New trade ideas.
  - Community replies.
  - Weekly progress digest.
  - Product updates.
- Learning preferences:
  - Risk profile.
  - Default session.
- Security:
  - Change password.
  - MFA/passkeys.
  - Active sessions.
  - Connected accounts.
  - Delete account/export data.

Acceptance criteria:
- Notification preferences are honored across email/in-app/push.
- Email change requires verification and step-up auth.
- Account deletion starts a compliant deletion workflow.

### 8.17 Admin Console

Design source:
- `shell.js` admin nav declares Overview, Members, Courses, Lessons, Webinars, Trade Ideas, AI Knowledge, Community Mod, Affiliates, Revenue, White-label, CRM/Integrations, Settings.

Requirements:
- Admin overview:
  - Members, MRR, churn, active learners, webinar attendance, AI usage, community reports, failed payments.
- Members:
  - Search/filter users.
  - View profile, plan, progress, journal metadata, community status.
  - Impersonate with explicit audit and limited scope.
  - Suspend/ban.
  - GDPR export/delete.
- Courses/Lessons:
  - Create/edit tiers, modules, lessons, quizzes.
  - Upload media.
  - Manage captions, transcripts, notes.
  - Publish/unpublish.
- Webinars:
  - Schedule/edit/cancel.
  - Manage stream keys securely.
  - View registrations.
  - Moderate live chat.
  - Process replay.
- Trade Ideas:
  - Create/edit/publish/archive.
  - Disclosure acknowledgement.
  - Attach chart.
  - Link lesson/playbook.
- AI Knowledge:
  - Manage curriculum snippets.
  - Re-index content.
  - View flagged AI conversations.
  - Configure policy/guardrails.
- Community Mod:
  - Reports queue.
  - Moderation actions.
  - Banned phrases.
  - User discipline history.
- Affiliates:
  - Applications.
  - Referral codes.
  - Commission rates.
  - Fraud review.
  - Payout status.
- Revenue:
  - Subscriptions, invoices, refunds, failed payments, coupon performance.
- White-label:
  - Partners, domains, branding, licensing, tenant settings.
- CRM/Integrations:
  - Webhooks, email lists, lifecycle tools, data exports.
- Settings:
  - Roles, permissions, audit logs, feature flags, risk disclosures.

Acceptance criteria:
- Admin requires MFA.
- Every admin mutation writes an audit log.
- Dangerous actions require step-up auth and reason note.

### 8.18 Affiliate Portal

Design sources:
- Affiliate landing page.
- `shell.js` affiliate nav declares Overview, Referral Link, Commissions, Payouts, Promo Assets, Settings.

Requirements:
- Affiliate onboarding:
  - Application form.
  - Terms and affiliate disclosure acceptance.
  - Stripe Connect onboarding.
- Referral link:
  - Unique code.
  - Campaign/UTM builder.
  - QR/share assets.
- Overview:
  - Clicks, signups, trials, paid conversions, active referrals, MRR referred, projected payout.
- Commissions:
  - Basic: 20% recurring.
  - Pro: 30% recurring.
  - 60-day cookie, last-touch attribution per design.
  - Refund/chargeback adjustments.
- Payouts:
  - Stripe Connect status.
  - Pending, available, paid.
  - Tax/KYC status where required.
- Promo assets:
  - Banners.
  - Swipe copy.
  - Webinar links.
  - Social graphics.
- Settings:
  - Profile.
  - Payout account.
  - Disclosure confirmation.

Acceptance criteria:
- Attribution is tamper-resistant and server-side.
- Affiliate cannot self-refer unless explicitly allowed.
- Payouts are blocked until KYC/disclosure requirements are complete.

### 8.19 White-Label Partner Portal

Design sources:
- White-label landing page.
- `shell.js` partner nav declares Partner Overview, Branding, Domain, Course Library, Members, Revenue/Licensing, Team Access, Settings.

Requirements:
- Partner onboarding:
  1. Org details.
  2. Branding and domain.
  3. Course library and team.
  4. Launch checklist.
- Branding:
  - Logo.
  - Favicon.
  - Primary/accent colors.
  - Dark/light preference.
  - Legal/footer copy.
- Domain:
  - Custom app domain.
  - DNS instructions.
  - Ownership verification.
  - SSL provisioning.
- Course library:
  - Use FX Academy curriculum.
  - Add partner-specific content if enabled.
  - Hide/show tiers.
- Members:
  - Invite/import users.
  - View engagement.
  - Manage roles.
- Revenue/licensing:
  - Seats, active members, license fees, revenue share, invoices.
- Team access:
  - Partner owner/admin/educator/support roles.
- Settings:
  - Tenant preferences.
  - Legal disclosures.
  - Support contact.

Acceptance criteria:
- Tenant data is isolated in every query.
- Partner admins cannot access FX Academy global admin data.
- Custom domains require verified ownership before routing traffic.

## 9. Data Model

Core entities:
- `users`: Auth0 ID, email, name, status, country, age confirmation, created_at.
- `profiles`: display name, avatar, bio, risk profile, default session, onboarding state.
- `organizations`: tenant/partner, type, owner, status, branding config, domain config.
- `memberships`: user, organization, roles, status.
- `plans`: Basic, Pro, Elite, partner license.
- `subscriptions`: Stripe customer/subscription IDs, plan, status, current period, cancel state.
- `entitlements`: user/org, feature key, source, start/end, active.
- `courses`: tier, title, description, access level, status.
- `modules`: course, title, order.
- `lessons`: module, title, duration, media asset, transcript, notes, quiz policy.
- `lesson_assets`: S3 key, media renditions, captions, thumbnails, DRM/signed playback metadata.
- `progress`: user, lesson/module/course, watch percent, completed_at, XP.
- `quizzes`: lesson/course, questions, passing threshold.
- `quiz_attempts`: user, answers, score, pass/fail.
- `certificates`: user, tier/course, verification ID, issued_at, PDF asset.
- `webinars`: title, host, topic, start/end, access level, IVS channel, recording config.
- `webinar_registrations`: webinar, user/email, status, reminders.
- `webinar_recordings`: webinar, S3 prefix, playback asset, transcript, AI summary.
- `ai_conversations`: user, lesson/context, mode, status, redaction state.
- `ai_messages`: conversation, role, redacted content, policy flags.
- `trades`: user, instrument, direction, setup, session, entry, stop, target, result, R, emotion, thesis, reflection.
- `trade_attachments`: trade, S3 asset, type.
- `analytics_snapshots`: user, period, metrics JSON, generated_at.
- `strategies`: title, category, difficulty, rules, access level, related lessons.
- `trade_ideas`: educator, instrument, bias, timeframe, analysis, invalidation, objective, access level, disclosure ack.
- `market_quotes`: instrument, quote, source, timestamp, cache TTL.
- `news_items`: source, headline, impact, asset tags, timestamp.
- `community_channels`: tenant, name, access level.
- `community_posts`: channel, author, body, status, moderation flags.
- `community_comments`: post, author, body, status.
- `reactions`: target, user, type.
- `reports`: target, reporter, reason, status.
- `pods`: name, tenant, capacity, rules.
- `pod_members`: pod, user, role.
- `notifications`: user, type, payload, read_at.
- `notification_preferences`: user, channel, type, enabled.
- `affiliates`: user/org, code, status, commission config.
- `referrals`: affiliate, visitor ID, user, campaign, attribution source, conversion state.
- `commissions`: referral, subscription, amount, status, payout.
- `payouts`: affiliate, Stripe transfer/payout IDs, amount, status.
- `audit_logs`: actor, action, target, metadata, IP, user agent, created_at.
- `feature_flags`: key, audience, rollout, status.

## 10. Key Events

- `user.created`
- `user.completed_onboarding`
- `subscription.created`
- `subscription.updated`
- `subscription.past_due`
- `subscription.cancelled`
- `entitlement.changed`
- `lesson.started`
- `lesson.progress_updated`
- `lesson.completed`
- `quiz.passed`
- `certificate.issued`
- `webinar.registered`
- `webinar.reminder_due`
- `webinar.stream_started`
- `webinar.stream_ended`
- `webinar.recording_ready`
- `ai.message_flagged`
- `trade.logged`
- `analytics.snapshot_ready`
- `trade_idea.published`
- `community.post_reported`
- `affiliate.referral_attributed`
- `commission.earned`
- `payout.ready`
- `partner.domain_verified`
- `admin.action_performed`

All events should be idempotent and traceable.

## 11. API Requirements

API design:
- REST or GraphQL for app data; REST is sufficient for v1.
- Server-side schema validation with Zod or equivalent.
- Strict authorization middleware.
- Idempotency keys for webhooks and payment-related operations.
- Cursor pagination for lists.
- Audit context attached to every admin mutation.

Critical APIs:
- `GET /me`
- `GET /entitlements`
- `GET /dashboard`
- `GET /courses`
- `GET /courses/:id`
- `GET /lessons/:id/playback-token`
- `POST /lessons/:id/progress`
- `POST /lessons/:id/complete`
- `POST /quiz-attempts`
- `POST /checkout/session`
- `POST /billing/portal-session`
- `POST /stripe/webhook`
- `GET /webinars`
- `POST /webinars/:id/register`
- `GET /webinars/:id/join-token`
- `GET /replays`
- `POST /ai/conversations`
- `POST /ai/conversations/:id/messages`
- `GET /journal/trades`
- `POST /journal/trades`
- `GET /analytics`
- `GET /community/channels`
- `POST /community/posts`
- `POST /community/reports`
- `GET /admin/audit-logs`

## 12. Performance And Scale

Targets:
- Public pages: LCP under 2.5s on mobile p75.
- Authenticated app shell: route transitions under 500ms after initial load for cached app data.
- API p95 under 300ms for common reads.
- Dashboard p95 under 800ms including aggregated data.
- Live webinar playback start under 3s for most users.
- AI tutor first token under 2s for simple answers, under 5s for retrieval-heavy answers.
- Journal save under 500ms p95.
- Search under 300ms p95.

Scale assumptions for v1:
- 50,000 registered users.
- 10,000 paid subscribers.
- 5,000 concurrent live webinar viewers.
- 500 concurrent active community users.
- 100 AI requests/minute sustained with burst handling.

Scale path:
- IVS handles streaming scale.
- Aurora read replicas for analytics-heavy reads.
- Redis cache for dashboard, entitlements, and provider data.
- SQS workers for AI summaries, transcripts, certificates, notifications.
- Partition or archive event-heavy tables as usage grows.

## 13. Launch Phases

### Phase 0: Foundations

Deliver:
- Monorepo structure.
- Auth0 integration.
- Stripe products/prices/webhooks.
- Aurora schema.
- Entitlement service.
- Audit logging.
- S3 media storage.
- CI/CD, environments, secrets, logging.

Exit criteria:
- Secure login/signup.
- Subscription state drives access.
- Admin MFA and audit logs working.

### Phase 1: MVP Academy

Deliver:
- Public marketing pages.
- Signup, checkout, onboarding, checkout success.
- Member dashboard.
- Course library for Entry/Beginner.
- Lesson player with VOD, transcript, notes, quiz.
- Progress tracking.
- Risk calculator.
- Trade journal/log trade.
- Billing portal.
- Settings/notifications basic.

Exit criteria:
- A new user can purchase Basic/Pro, onboard, watch lessons, complete a quiz, log a trade, and manage billing.

### Phase 2: Pro Value

Deliver:
- Full curriculum tiers.
- AI tutor.
- Live webinars with IVS.
- Replay library.
- Certificates.
- Performance analytics.
- Strategy library.
- Trade ideas.
- Market prices/news.

Exit criteria:
- A Pro user can attend a live webinar, watch replay, use AI tutor, earn certificate, and see analytics from journal data.

### Phase 3: Community And Growth

Deliver:
- Community channels and pods.
- Moderation tools.
- Affiliate portal.
- Referral tracking.
- Stripe Connect payouts.
- Lifecycle emails and progress digests.

Exit criteria:
- Affiliate conversion is tracked from referral visit through paid subscription and commission accrual.
- Community moderation workflow is production-ready.

### Phase 4: Partner And Elite

Deliver:
- White-label partner onboarding.
- Branding and custom domains.
- Partner members and team access.
- Revenue/licensing dashboards.
- Elite cohort/coaching flows.
- Optional two-way small group video via LiveKit Cloud or Amazon Chime SDK.

Exit criteria:
- A partner can launch a branded academy with isolated members, theme, domain, and reporting.

## 14. Open Decisions

1. Exact primary AWS region: choose based on expected first market. If India-heavy, consider ap-south-1 for app/data with global CloudFront/IVS viewing; otherwise us-east-1 for broad service maturity.
2. Auth0 tenant strategy for white-label: shared tenant with Organizations for standard partners; separate tenant for enterprise partners requiring custom login domains.
3. Market data provider contract and attribution language.
4. Whether community should use custom Postgres+realtime or a managed community/chat provider.
5. Whether AI tutor uses OpenAI-hosted vector stores for non-sensitive curriculum or private pgvector retrieval only.
6. Mobile app timing: PWA first, native app later if retention demands it.

## 15. Source Notes

Design-derived sources:
- Public screens: `public/home.html`, `public/pricing.html`, `public/checkout.html`, `public/curriculum.html`, `public/webinars-landing.html`, `public/trading-tools.html`, `public/ai-learning-landing.html`, `public/affiliate-landing.html`, `public/whitelabel-landing.html`, `public/login.html`, `public/signup.html`.
- Member screens: `member/dashboard.html`, `member/learn.html`, `member/lesson.html`, `member/webinars.html`, `member/ai-tutor.html`, `member/journal.html`, `member/trade-new.html`, `member/risk-calculator.html`, `member/analytics.html`, `member/community.html`, `member/certificates.html`, `member/prop-firm.html`, `member/strategies.html`, `member/trade-ideas.html`, `member/billing.html`, `member/notifications.html`, `member/settings.html`.
- Navigation and role surfaces: `assets/shell.js`.

External service references checked on 2026-06-22:
- AWS IVS managed low-latency streaming and global viewing: https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/what-is.html
- AWS IVS auto-record to S3: https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/record-to-s3.html
- AWS IVS private channels: https://docs.aws.amazon.com/ivs/latest/LowLatencyUserGuide/private-channels.html
- Aurora Serverless v2 autoscaling and multi-tenant suitability: https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html
- AWS WAF and Shield: https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html
- AWS Secrets Manager: https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html
- Auth0 Universal Login: https://auth0.com/docs/authenticate/login/auth0-universal-login
- Auth0 MFA: https://auth0.com/docs/secure/multi-factor-authentication
- Auth0 Organizations: https://auth0.com/docs/manage-users/organizations/organizations-overview
- Auth0 RBAC: https://auth0.com/docs/manage-users/access-control/rbac
- Stripe Checkout: https://docs.stripe.com/payments/checkout
- Stripe Billing: https://docs.stripe.com/billing
- Stripe Customer Portal: https://docs.stripe.com/customer-management
- Stripe Connect: https://docs.stripe.com/connect
- OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses
- OpenAI retrieval/vector stores: https://platform.openai.com/docs/guides/retrieval
- OpenAI safety best practices: https://platform.openai.com/docs/guides/safety-best-practices
- Massive/Polygon forex APIs: https://polygon.io/docs/forex/getting-started
- Trading Economics API documentation: https://docs.tradingeconomics.com/
