# CI/CD & Security Baseline (F6)

The continuous-integration and security pipeline for the FX Academy monorepo.
This is the **F6** foundation deliverable from [`../PROJECT.md`](../PROJECT.md)
§6.6 (CI security gates) and §8 (foundation track). Workflows live in
[`../.github/workflows/`](../.github/workflows/); Dependabot config in
[`../.github/dependabot.yml`](../.github/dependabot.yml).

All workflows follow the same hardening rules: **action versions pinned to a
major**, **least-privilege `permissions:` per workflow**, and **`concurrency`
with `cancel-in-progress`** so superseded runs don't waste CI minutes. None of
them require any secret beyond the automatic `GITHUB_TOKEN`.

## Workflows

### `ci.yml` — build correctness
Runs on push to `main` and on every pull request.

Pipeline: checkout → `pnpm/action-setup` (pnpm 9) → `actions/setup-node@v4`
(Node 22, pnpm cache) → `pnpm install --frozen-lockfile` → `pnpm lint` →
`pnpm typecheck` → `pnpm test` → `pnpm build`. Every step runs through
Turborepo, matching the root `package.json` scripts.

**Real merge gates:** `typecheck`, `test`, `build`.

**`lint` is non-blocking today** (`continue-on-error: true`) because ESLint
config is still pending in some packages, where `turbo run lint` is a no-op.
The step stays in the pipeline for visibility; once the real ESLint config
lands it should become a hard gate (remove `continue-on-error`).

### `codeql.yml` — SAST
`github/codeql-action` analysing the `javascript-typescript` language. Runs on
push to `main`, on pull requests, and on a **weekly schedule** (Mondays) so
newly published query packs catch issues even when the code is idle. Uses the
`security-and-quality` query suite. Findings surface in the repo's
**Security → Code scanning** tab.

### `security.yml` — secret + dependency scanning
Two jobs:

- **`secret-scan`** — `gitleaks/gitleaks-action` scans the full git history
  (`fetch-depth: 0`) for committed secrets. A planted secret fails this job.
- **`dependency-review`** — `actions/dependency-review-action`, **gated to
  `pull_request`** (it is a diff-based check). Fails the PR when a dependency
  change introduces a **high-or-above** severity advisory, and posts a summary
  comment on the PR.

### `dependabot.yml` — automated updates
Weekly (`npm` ecosystem) updates for the root manifest and **each workspace**
(`apps/web`, `apps/api`, `packages/ui`, `packages/config`,
`packages/contracts`, `packages/entitlements`, `packages/db`), plus the
`github-actions` ecosystem so the action pins above stay current. Minor/patch
bumps are grouped per package to keep PR volume low; majors come as separate
PRs for isolated review.

## Gate summary — what each check enforces

| Gate | Workflow | Blocks merge? | Checks |
|---|---|---|---|
| Typecheck | `ci.yml` | **Yes** | `tsc` across all packages (strict) |
| Test | `ci.yml` | **Yes** | Unit + integration + E2E via Turborepo |
| Build | `ci.yml` | **Yes** | Production build of every app/package |
| Lint | `ci.yml` | No (pending) | ESLint — non-blocking until config lands |
| SAST | `codeql.yml` | **Yes** (CRITICAL) | CodeQL static analysis of JS/TS |
| Secret scan | `security.yml` | **Yes** | Gitleaks over full history |
| Dependency review | `security.yml` | **Yes** (PR, high+) | New vulnerable/disallowed deps |
| Dependency updates | `dependabot.yml` | n/a | Weekly automated update PRs |

> "Blocks merge" assumes the corresponding checks are configured as
> **required status checks** in the repository's branch-protection rules for
> `main`. The workflows produce the signals; branch protection enforces them.

## Known-pending items

- **Real ESLint config** — `lint` is a no-op / non-blocking in some packages
  until the shared ESLint config (`packages/config`) is wired. Once it exists,
  make the `ci.yml` lint step a hard gate (remove `continue-on-error`).
- **DAST against staging** — PROJECT.md §6.6 requires OWASP ZAP DAST against
  the staging environment. This is **deferred until a staging environment is
  deployed** (Railway preview/staging envs, per §5). Add a DAST workflow
  triggered post-deploy against the staging URL at that point.
- **Branch protection** — the required-status-checks configuration that turns
  these workflows into hard merge gates is a repo setting, applied once on
  `fxunlockdev/FX-Edu` (not code in this repo).
- **Preview environments & Terraform plan/apply** — the per-PR preview env and
  AWS Terraform plan/apply steps named in §8 (F6) are out of scope for this
  baseline and land with the Railway/Terraform infra work.
