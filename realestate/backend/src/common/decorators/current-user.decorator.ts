import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../guards/central-auth.guard';

/**
 * Injects the locally-synced `RealUser` (+ central auth claims) that the
 * `CentralAuthGuard` attached to the request, e.g.:
 *
 *   findMine(@CurrentUser() user: RequestUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: RequestUser = request.user;
    return data ? user?.[data] : user;
  },
);
