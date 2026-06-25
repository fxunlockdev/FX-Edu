import { Inject, Injectable } from '@nestjs/common';
import {
  withTenant,
  type Database,
  type TenantContext,
} from '@fxunlock/db';
import type { AuthContext } from '../../common/auth/auth-context';
import { DB } from './db.tokens';

/** A transaction handle carrying the same typed query surface as the client. */
export type TenantTransaction = Parameters<
  Parameters<Database['transaction']>[0]
>[0];

/**
 * Runs queries under the caller's tenant.
 *
 * Every tenant-scoped statement must execute inside a transaction that first
 * sets the session GUCs `app.current_org` / `app.current_role` (and, when
 * present, `app.current_user`). Postgres RLS policies read these via
 * `current_setting('app.current_org', true)` and scope every read/write to the
 * caller's org (PROJECT.md §6.1, §6.3). `withTenant` uses transaction-local
 * `set_config(..., true)` so the setting never leaks across pooled connections.
 *
 * This service is the only sanctioned way for request handlers to touch
 * tenant-scoped tables; inject the raw {@link DB} client only for global tables
 * (e.g. `plans`) that carry no `org_id`.
 */
@Injectable()
export class TenantDbService {
  constructor(@Inject(DB) private readonly db: Database) {}

  /**
   * Execute `work` with the caller's tenant GUCs set. The transaction handle
   * passed to `work` keeps full, typed Drizzle query access.
   */
  async run<T>(
    auth: AuthContext,
    work: (tx: TenantTransaction) => Promise<T>,
  ): Promise<T> {
    return withTenant(this.db, TenantDbService.toTenantContext(auth), work);
  }

  /** Derive the immutable tenant context the DB layer needs from the principal. */
  private static toTenantContext(auth: AuthContext): TenantContext {
    return {
      orgId: auth.orgId,
      role: auth.role,
      userId: auth.sub,
    };
  }
}
