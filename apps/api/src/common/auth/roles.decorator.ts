import { SetMetadata } from '@nestjs/common';
import type { Role } from './auth-context';

export const ROLES_KEY = 'fx:roles';

/**
 * Restricts a route to one or more roles. Enforced by RolesGuard against the
 * verified JWT `role` claim. UI locks are hints; this is a real gate, and RLS
 * enforces the same role independently at the database.
 */
export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
