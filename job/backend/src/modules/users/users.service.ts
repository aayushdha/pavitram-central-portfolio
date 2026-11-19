import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortalRole } from '../../common/enums/portal.enums';
import { User } from '../../database/entities/user.entity';
import { sanitizeUser, SafeUser } from '../../common/utils/sanitize-user.util';
import { CentralAuthService } from '../central-auth/central-auth.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly centralAuth: CentralAuthService,
  ) {}

  async getById(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Updates local profile fields, and best-effort forwards the subset that
   * also lives on the Central Auth side (name/address/city/state/profession/
   * designation/organization) via PATCH /auth/profile there. If the stored
   * central token has expired, the local update still succeeds — we just
   * report centralSynced: false so the client can prompt a re-login later.
   */
  async updateProfile(
    currentUser: User,
    dto: UpdateProfileDto,
  ): Promise<{ user: SafeUser; centralSynced: boolean }> {
    let centralSynced = false;

    if (currentUser.centralAccessToken) {
      try {
        await this.centralAuth.updateProfile(currentUser.centralAccessToken, {
          name: dto.name,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          profession: dto.profession,
          designation: dto.designation,
          organization: dto.organization,
        });
        centralSynced = true;
      } catch (err) {
        this.logger.warn(
          `Central profile sync failed for user ${currentUser.id}: ${(err as Error).message}`,
        );
      }
    }

    const merged = this.users.merge(currentUser, {
      name: dto.name ?? currentUser.name,
      address: dto.address ?? currentUser.address,
      city: dto.city ?? currentUser.city,
      state: dto.state ?? currentUser.state,
      profession: dto.profession ?? currentUser.profession,
      designation: dto.designation ?? currentUser.designation,
      organization: dto.organization ?? currentUser.organization,
      headline: dto.headline ?? currentUser.headline,
      skills: dto.skills ?? currentUser.skills,
      resumeUrl: dto.resumeUrl ?? currentUser.resumeUrl,
      bio: dto.bio ?? currentUser.bio,
      avatarUrl: dto.avatarUrl ?? currentUser.avatarUrl,
      isOnboarded: true,
    });

    const updated = await this.users.save(merged);
    return { user: sanitizeUser(updated), centralSynced };
  }

  async updateRole(currentUser: User, dto: UpdateRoleDto): Promise<{ user: SafeUser }> {
    if (currentUser.role === PortalRole.ADMIN) {
      throw new ForbiddenException('Admin accounts cannot self-downgrade through this endpoint');
    }

    const updated = await this.users.save(
      this.users.merge(currentUser, { role: dto.role as PortalRole }),
    );
    return { user: sanitizeUser(updated) };
  }

  /** Limited fields shown to other users (e.g. a seeker card an employer views). */
  async getPublicProfile(id: string) {
    const user = await this.getById(id);
    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      city: user.city,
      state: user.state,
      headline: user.headline,
      skills: user.skills,
      bio: user.bio,
      memberSince: user.createdAt,
    };
  }
}
