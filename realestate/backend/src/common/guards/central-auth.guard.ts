import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RealRole } from '@prisma/client';
import { CentralAuthService } from '../../central-auth/central-auth.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface RequestUser {
  /** Local RealUser.id — use this for all foreign keys inside this service. */
  id: string;
  centralUserId: string;
  email: string;
  phone: string | null;
  name: string | null;
  /** Raw role from the central auth service: USER | ADMIN | SUPER_ADMIN. */
  centralRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  /** Functional role(s) inside the real-estate module. */
  roles: RealRole[];
  ownerType: string | null;
  kycStatus: string;
}

/**
 * Validates the `Authorization: Bearer <token>` header against the central
 * Pavitram Auth API (see CentralAuthService) and makes sure a local
 * `RealUser` shadow row exists for that person, then attaches it to
 * `request.user`.
 *
 * This is the ONLY place a token is ever checked — this service issues no
 * tokens of its own and has no signup/signin endpoints. Every protected
 * route in this module should be decorated with:
 *
 *   @UseGuards(CentralAuthGuard)
 */
@Injectable()
export class CentralAuthGuard implements CanActivate {
  constructor(
    private readonly centralAuth: CentralAuthService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request.headers?.authorization);

    const centralUser = await this.centralAuth.verifyToken(token);

    // ADMIN / SUPER_ADMIN on the central side always maps onto the local
    // ADMIN role for this module, in addition to whatever roles the user
    // already picked up here (e.g. they can still be an OWNER too).
    const isCentralAdmin =
      centralUser.role === 'ADMIN' || centralUser.role === 'SUPER_ADMIN';

    let user = await this.prisma.realUser.findUnique({
      where: { centralUserId: centralUser.userId },
    });

    if (!user) {
      user = await this.prisma.realUser.create({
        data: {
          centralUserId: centralUser.userId,
          email: centralUser.email,
          roles: isCentralAdmin ? [RealRole.ADMIN, RealRole.SEEKER] : [RealRole.SEEKER],
        },
      });
    } else if (
      user.email !== centralUser.email ||
      (isCentralAdmin && !user.roles.includes(RealRole.ADMIN))
    ) {
      user = await this.prisma.realUser.update({
        where: { id: user.id },
        data: {
          email: centralUser.email,
          roles: isCentralAdmin
            ? Array.from(new Set([...user.roles, RealRole.ADMIN]))
            : user.roles,
        },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    const requestUser: RequestUser = {
      id: user.id,
      centralUserId: user.centralUserId,
      email: user.email,
      phone: user.phone,
      name: user.name,
      centralRole: centralUser.role,
      roles: user.roles,
      ownerType: user.ownerType,
      kycStatus: user.kycStatus,
    };

    request.user = requestUser;
    return true;
  }

  private extractToken(authorizationHeader?: string): string {
    if (!authorizationHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }
    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Authorization header must be: Bearer <token>');
    }
    return token;
  }
}
