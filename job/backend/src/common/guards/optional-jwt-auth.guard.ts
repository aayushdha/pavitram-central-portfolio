import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Used on routes that are publicly viewable but behave slightly differently
 * for a logged-in user (e.g. a property detail page: anonymous visitors can
 * see it, but the owner viewing their own listing shouldn't bump the view
 * counter). Never rejects the request — worst case request.user is undefined.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(_err: unknown, user: unknown): TUser {
    return (user || undefined) as TUser;
  }
}
