# @fxunlock/entitlements

Pure, dependency-free entitlement **decision logic** for FX Academy. No I/O, no
clock, no mutation — every function is total and deterministic.

> UI locks are hints only. This package is the *policy*; the API and Postgres
> RLS are the *enforcement* (PROJECT.md §6.2). Always re-check server-side.

## The plan → feature matrix (PRD §5)

| Feature | Basic | Pro | Elite |
| --- | :---: | :---: | :---: |
| Entry / Beginner courses | allow | allow | allow |
| Intermediate / Advanced / Psychology | locked | allow | allow |
| Journal · Risk calculator · Certificates | allow | allow | allow |
| Webinars · AI tutor · Analytics | locked | allow | allow |
| Community · Trade ideas · Prop firm · Strategy library | locked | allow | allow |

`allow` = included · `locked` = a higher plan offers it (render upgrade path)
· `deny` = no path, or a hard block (lapsed payment, expired/revoked media token).

## API

```ts
import {
  isSubscriptionActive,
  canAccessFeature,
  canAccessCourseTier,
  resolveEntitlements,
} from '@fxunlock/entitlements';

isSubscriptionActive('past_due'); // false (only active|trialing are active)

canAccessFeature({
  plan: 'basic',
  subscriptionStatus: 'active',
  featureKey: 'ai_tutor',
}); // 'locked'

canAccessCourseTier({
  plan: 'pro',
  subscriptionStatus: 'active',
  featureKey: 'tier_advanced',
  tier: 'advanced',
  mediaTokenState: 'expired',
}); // 'deny' — entitled by plan, but the playback token is dead

resolveEntitlements('pro', 'past_due');
// { webinars: 'deny', ai_tutor: 'deny', journal: 'allow', ... }
```

## Key semantics

- **`locked` vs `deny`.** `locked` = "upgrade to unlock" (a higher plan offers
  it). `deny` = "you cannot have this now" (plan includes it but the
  subscription lapsed, or a media token is expired/revoked).
- **Inactive subscription denies gated access.** Only `active` and `trialing`
  grant paid features.
- **Downgrade preserves data, locks views.** A user who drops to Basic keeps
  read access to their **journal, certificates, and risk calculator**, while
  Pro **views** (analytics, community, …) lock. Owned data stays reachable even
  if the subscription is inactive.
- **Free public webinars** bypass the plan gate when
  `webinarAccess: 'free_public'`.

## Testing

```bash
pnpm --filter @fxunlock/entitlements test
pnpm --filter @fxunlock/entitlements test:coverage
```

Coverage spans each plan × each feature, inactive-subscription denials,
locked-vs-deny semantics, media-token gating, and the downgrade data-preserving
rule. All inputs are exercised for totality and immutability.
