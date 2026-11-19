import { User } from '../../database/entities/user.entity';

export type SafeUser = Omit<User, 'centralAccessToken' | 'centralAccessTokenIssuedAt'>;

/**
 * Strips sensitive/internal fields before a User ever goes into an API
 * response. `__jti` isn't a real column — JwtStrategy stamps it onto
 * request.user at runtime so controllers can revoke the current session on
 * logout — but it must never leak back out in a response body.
 */
export function sanitizeUser(user: User & { __jti?: string }): SafeUser {
  const { centralAccessToken, centralAccessTokenIssuedAt, __jti, ...safe } = user as User & {
    __jti?: string;
  };
  return safe;
}
