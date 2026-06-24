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
  /** Raw bearer token, kept for downstream calls that must forward the JWT. */
  readonly token: string;
}

/** Property name under which the AuthContext is stashed on the request. */
export const AUTH_CONTEXT_KEY = 'fxAuth' as const;

export interface RequestWithAuth {
  [AUTH_CONTEXT_KEY]?: AuthContext;
}
