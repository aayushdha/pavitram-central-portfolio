import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Session } from '../../../database/entities/session.entity';
import { User } from '../../../database/entities/user.entity';

export interface JwtPayload {
  sub: string; // local User.id
  jti: string; // Session.jti — lets us revoke individual tokens on logout
  centralUserId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const session = await this.sessions.findOne({ where: { jti: payload.jti } });

    if (!session || session.revoked) {
      throw new UnauthorizedException('Session has been revoked. Please log in again.');
    }
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session has expired. Please log in again.');
    }

    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }
    if (user.accountStatus === 'SUSPENDED') {
      throw new UnauthorizedException('This account has been suspended.');
    }

    // Attaches to request.user — also stash the session jti for logout.
    return { ...user, __jti: payload.jti };
  }
}
