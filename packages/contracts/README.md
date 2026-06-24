# @fxunlock/contracts

Zod schemas and the TypeScript types inferred from them — the **single source of
truth** for API request/response shapes shared by `apps/api`, `apps/web`, and
`packages/sdk`.

Every schema is meant to validate at a boundary. Never trust external data
(API input, provider responses, file content): parse it through these schemas
first (ENGINEERING.md).

## Layout

| File | Endpoints / concern |
| --- | --- |
| `envelope.ts` | `{ ok, data, error, meta? }` response envelope + cursor pagination |
| `common.ts` | shared primitives (id, timestamp, plan, tier, decision, currency…) |
| `identity.ts` | `GET /me`, `GET /entitlements` |
| `dashboard.ts` | `GET /dashboard` (aggregated, locked-card aware) |
| `courses.ts` | `GET /courses`, `GET /courses/:id`, `GET /lessons/:id/playback-token`, `POST /lessons/:id/progress`, `POST /lessons/:id/complete`, `POST /quiz-attempts` |
| `billing.ts` | `POST /checkout/session`, `POST /billing/portal-session` |
| `webinars.ts` | `GET /webinars`, `POST /webinars/:id/register` |
| `journal.ts` | `GET /journal/trades`, `POST /journal/trades` |
| `analytics.ts` | `GET /analytics` |
| `community.ts` | `GET /community/channels`, `POST /community/posts`, `POST /community/reports` |

Everything is re-exported from `src/index.ts`.

## The envelope

```ts
import { apiEnvelope, successEnvelope, MeResponseSchema } from '@fxunlock/contracts';

// Validate a response of unknown success/failure:
const parsed = apiEnvelope(MeResponseSchema).parse(await res.json());
if (parsed.ok) {
  parsed.data; // MeResponse
} else {
  parsed.error; // { code, message, details? }
}
```

List endpoints carry cursor pagination in `meta`:

```ts
import { successEnvelope, ListCoursesResponseSchema } from '@fxunlock/contracts';
const schema = successEnvelope(ListCoursesResponseSchema);
// schema.parse(...).meta?.nextCursor / hasMore / limit / total
```

## Request validation

```ts
import { CreateTradeRequestSchema } from '@fxunlock/contracts';

const body = CreateTradeRequestSchema.parse(req.body);
// rMultiple / win-loss are NOT in the request — server computes them, so
// clients cannot forge performance stats (PRD §8.8).
```

## Notes

- Enums (`Plan`, `SubscriptionStatus`, `CourseTier`, `Decision`, `FeatureKey`)
  intentionally mirror `@fxunlock/entitlements` so the two packages agree on the
  domain vocabulary.
- Pagination `limit` is bounded (max 100) to avoid unbounded queries.
- Locked dashboard cards return `{ decision, data: null }` so no protected
  content leaks to a non-entitled client (PRD §8.3).
