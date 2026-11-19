import { SetMetadata } from '@nestjs/common';
import { RealRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to users who hold at least one of the given real-estate
 * roles (SEEKER / OWNER / PROVIDER / ADMIN). Must be used together with
 * `CentralAuthGuard` (which populates `request.user`) and `RolesGuard`.
 *
 * Example:
 *   @Roles(RealRole.OWNER)
 *   @UseGuards(CentralAuthGuard, RolesGuard)
 *   create(...) { ... }
 */
export const Roles = (...roles: RealRole[]) => SetMetadata(ROLES_KEY, roles);
