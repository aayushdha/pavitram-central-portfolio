import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

export type JwtPayload = { sub: string; email: string; role: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET") || "pavitram-dev-secret",
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.mainUser.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException("Account no longer exists");
    if (user.accountStatus === "SUSPENDED") {
      throw new UnauthorizedException("Your account has been suspended. Contact support.");
    }
    // Attached to req.user for @CurrentUser() / RolesGuard
    return {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
