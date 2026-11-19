import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RealRole } from '@prisma/client';
import { RequestUser } from './central-auth.guard';

/**
 * Must run AFTER `CentralAuthGuard` (which populates `request.user`).
 * Allows the request through if the user holds at least one of the roles
 * declared with `@Roles(...)`, or if no `@Roles` metadata is present at all.
 * ADMIN always passes, regardless of which roles were requested.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RealRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: RequestUser | undefined = request.user;

    if (!user) return false;
    if (user.roles.includes(RealRole.ADMIN)) return true;

    const allowed = requiredRoles.some((role) => user.roles.includes(role));
    if (!allowed) {
      throw new ForbiddenException(
        `This action requires one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }
    return true;
  }
}
