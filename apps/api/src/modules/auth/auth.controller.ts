import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { AuthContext, Role } from '../../common/auth/auth-context';

interface MeResponse {
  readonly user: { readonly id: string; readonly email?: string };
  readonly org: { readonly id: string };
  readonly role: Role;
}

/**
 * GET /me — the current principal as derived from the verified session JWT.
 *
 * Returns only what the JWT already carries (sub, org_id, role, email). No DB
 * read is required for identity context; richer profile data is fetched by the
 * web app from its own endpoints once @fxunlock/db is wired.
 */
@Controller('me')
export class AuthController {
  @Get()
  me(@CurrentUser() user: AuthContext): MeResponse {
    return {
      user: { id: user.sub, email: user.email },
      org: { id: user.orgId },
      role: user.role,
    };
  }
}
