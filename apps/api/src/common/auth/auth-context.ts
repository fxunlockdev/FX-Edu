/**
 * Roles recognised by the API. Mirrors the PRD's primary users (§4) and the
 * roles modeled in our own organizations/memberships tables. RLS reads the same
 * `role` claim natively via auth.jwt() — server-side authorization always.
 */
export const ROLES = [
  'member',
  'educator',
  'admin',
  'affiliate',
  'partner_admin',
] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/**
 * The authenticated principal derived from a verified Supabase Auth JWT.
 *
 * Immutable: guards build one and attach it to the request; handlers read it via
 * @CurrentUser(). `sub` = user id, `orgId` = active tenant, `role` = effective
 * role. These are exactly the claims RLS enforces independently in Postgres.
 */
export interface AuthContext {
  readonly sub: string;
  readonly orgId: string;
  readonly role: Role;
  readonly email?: string;
  /**
   * Authenticator Assurance Level from the session JWT (`aal` claim). Supabase
   * issues `aal1` for a single factor and `aal2` after an MFA step-up
   * (PROJECT.md §6.1). Step-up-gated flows (billing/portal changes) require
   * `aal2`. Undefined when the token carries no `aal` claim.
   */
  readonly aal?: AuthAssuranceLevel;
  /**
   * Authentication methods reference (`amr`) — the factors used this session
   * (e.g. `mfa`, `totp`, `password`). Kept so step-up checks can fall back to
   * `amr` when an explicit `aal2` claim is absent.
   */
  readonly amr?: readonly string[];
  /** Raw bearer token, kept for downstream calls that must forward the JWT. */
  readonly token: string;
}

/** Supabase Authenticator Assurance Levels. `aal2` means a fresh MFA step-up. */
export type AuthAssuranceLevel = 'aal1' | 'aal2';

/** Property name under which the AuthContext is stashed on the request. */
export const AUTH_CONTEXT_KEY = 'fxAuth' as const;

export interface RequestWithAuth {
  [AUTH_CONTEXT_KEY]?: AuthContext;
}
