import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RealRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../common/guards/central-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SubmitKycDocumentDto } from './dto/submit-kyc-document.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.realUser.findUnique({
      where: { id: userId },
      include: { providerProfile: true, subscriptions: { where: { status: 'ACTIVE' } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.realUser.update({ where: { id: userId }, data: dto });
    return { message: 'Profile updated successfully', user };
  }

  /**
   * A user may add SEEKER/OWNER/PROVIDER roles to themselves at any time
   * (e.g. a seeker who decides to list their own flat becomes an OWNER too).
   * ADMIN can never be self-granted — it only ever flows in from the central
   * auth service via `CentralAuthGuard` when that account is ADMIN/SUPER_ADMIN there.
   */
  async updateRoles(requester: RequestUser, dto: UpdateRoleDto) {
    if (!dto.roles || dto.roles.length === 0) {
      return { message: 'No changes', user: await this.prisma.realUser.findUnique({ where: { id: requester.id } }) };
    }
    if (dto.roles.includes(RealRole.ADMIN) && !requester.roles.includes(RealRole.ADMIN)) {
      throw new ForbiddenException('ADMIN role cannot be self-assigned');
    }

    const current = await this.prisma.realUser.findUniqueOrThrow({ where: { id: requester.id } });
    const merged = Array.from(new Set([...current.roles, ...dto.roles]));

    const user = await this.prisma.realUser.update({
      where: { id: requester.id },
      data: { roles: merged },
    });
    return { message: 'Roles updated successfully', user };
  }

  async submitKycDocument(userId: string, dto: SubmitKycDocumentDto) {
    const document = await this.prisma.realKycDocument.create({
      data: { userId, docType: dto.docType, docUrl: dto.docUrl },
    });
    return { message: 'Document submitted for verification', document };
  }

  async findMyKycDocuments(userId: string) {
    const documents = await this.prisma.realKycDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { documents };
  }

  /** Public-facing profile of an owner/agent/builder or service provider. */
  async findPublicProfile(id: string) {
    const user = await this.prisma.realUser.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        ownerType: true,
        businessName: true,
        kycStatus: true,
        city: true,
        roles: true,
        createdAt: true,
        _count: { select: { properties: true, projects: true } },
        providerProfile: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }
}
