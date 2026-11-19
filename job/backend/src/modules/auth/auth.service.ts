import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { PortalRole } from '../../common/enums/portal.enums';
import { User } from '../../database/entities/user.entity';
import { Session } from '../../database/entities/session.entity';
import { parseDurationToMs } from '../../common/utils/time.util';
import { sanitizeUser, SafeUser } from '../../common/utils/sanitize-user.util';
import { CentralAuthService } from '../central-auth/central-auth.service';
import { CentralAuthUser } from '../central-auth/central-auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    private readonly centralAuth: CentralAuthService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Registration is a two-step handshake with the central auth service:
   *   1. POST /auth/signup there (creates the row in their `main_users` table)
   *   2. POST /auth/signin there immediately after, to obtain an access_token
   *      (signup alone doesn't return one)
   * We then mirror the resulting user locally with the role chosen for THIS
   * module (buyer/seller/agent) and issue our own local session JWT.
   */
  async register(dto: RegisterDto): Promise<AuthResult> {
    await this.centralAuth.signup({
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
    });

    const signinResult = await this.centralAuth.signin({
      identifier: dto.email,
      password: dto.password,
    });

    let localUser = await this.upsertLocalUser(
      signinResult.user,
      dto.role,
      signinResult.access_token,
    );

    // Central signup doesn't take a name, so set it right after (best effort — signup still succeeds).
    const name = dto.name?.trim();
    if (name) {
      try {
        await this.centralAuth.updateProfile(signinResult.access_token, { name });
      } catch (err) {
        this.logger.warn(`Couldn't store the name on Central Auth for ${localUser.id}: ${(err as Error).message}`);
      }
      localUser = await this.users.save(this.users.merge(localUser, { name }));
    }
    return this.issueSession(localUser);
  }

  /**
   * Login proxies straight to central auth's /auth/signin, then upserts our
   * local mirror (in case the profile changed on the central side since we
   * last saw it) and issues a fresh local session JWT.
   */
  async login(dto: LoginDto): Promise<AuthResult> {
    const signinResult = await this.centralAuth.signin({
      identifier: dto.identifier,
      password: dto.password,
    });

    const localUser = await this.upsertLocalUser(
      signinResult.user,
      undefined,
      signinResult.access_token,
    );
    return this.issueSession(localUser);
  }

  async logout(userId: string, jti: string): Promise<{ message: string }> {
    await this.sessions.update({ jti, userId }, { revoked: true });
    return { message: 'Logged out successfully' };
  }

  async logoutAllSessions(userId: string): Promise<{ message: string }> {
    await this.sessions.update({ userId, revoked: false }, { revoked: true });
    return { message: 'Logged out of all devices' };
  }

  /** Re-pulls the latest profile from central auth using the CENTRAL token the client still holds. */
  async syncFromCentral(localUser: User, centralAccessToken: string): Promise<User> {
    const me = await this.centralAuth.validateToken(centralAccessToken);
    if (me.user.userId !== localUser.centralUserId) {
      throw new UnauthorizedException('Token does not belong to this account');
    }
    // /auth/me only returns id/email/role — pull the full profile via a no-op profile update.
    const fresh = await this.centralAuth.updateProfile(centralAccessToken, {});
    return this.upsertLocalUser(fresh.user);
  }

  private async upsertLocalUser(
    centralUser: CentralAuthUser,
    initialRole?: PortalRole | string,
    centralAccessToken?: string,
  ): Promise<User> {
    if (!centralUser.email) {
      throw new BadRequestException('Central auth did not return an email for this account');
    }

    const existing = await this.users.findOne({ where: { centralUserId: centralUser.id } });
    const role = (initialRole as PortalRole) || existing?.role || PortalRole.SEEKER;

    const merged = this.users.merge(existing ?? this.users.create(), {
      centralUserId: centralUser.id,
      email: centralUser.email,
      phone: centralUser.phone ?? undefined,
      name: centralUser.name || undefined,
      avatarUrl: centralUser.avatarUrl || undefined,
      role,
      centralRole: centralUser.role,
      accountStatus: centralUser.accountStatus,
      kycStatus: centralUser.kycStatus,
      isOnboarded: centralUser.isOnboarded,
      address: centralUser.address || undefined,
      city: centralUser.city || undefined,
      state: centralUser.state || undefined,
      profession: centralUser.profession || undefined,
      designation: centralUser.designation || undefined,
      organization: centralUser.organization || undefined,
      ...(centralAccessToken
        ? { centralAccessToken, centralAccessTokenIssuedAt: new Date() }
        : {}),
    });

    return this.users.save(merged);
  }

  private async issueSession(user: User): Promise<AuthResult> {
    const jti = randomUUID();
    const expiresIn = this.config.get<string>('jwt.expiresIn') || '7d';
    const expiresAt = new Date(Date.now() + parseDurationToMs(expiresIn));

    await this.sessions.save(this.sessions.create({ userId: user.id, jti, expiresAt }));

    const accessToken = this.jwt.sign({
      sub: user.id,
      jti,
      centralUserId: user.centralUserId,
      role: user.role,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: sanitizeUser(user),
    };
  }
}
