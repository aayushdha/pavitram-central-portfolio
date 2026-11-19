import { Injectable, NotFoundException } from '@nestjs/common';
import { ModerationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../common/guards/central-auth.guard';
import { ModerateListingDto } from './dto/moderate-listing.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [
      totalUsers,
      owners,
      seekers,
      providers,
      totalProperties,
      pendingProperties,
      totalProjects,
      pendingProjects,
      pendingKyc,
    ] = await this.prisma.$transaction([
      this.prisma.realUser.count(),
      this.prisma.realUser.count({ where: { roles: { has: 'OWNER' } } }),
      this.prisma.realUser.count({ where: { roles: { has: 'SEEKER' } } }),
      this.prisma.realUser.count({ where: { roles: { has: 'PROVIDER' } } }),
      this.prisma.realProperty.count(),
      this.prisma.realProperty.count({ where: { status: ModerationStatus.PENDING_REVIEW } }),
      this.prisma.realProject.count(),
      this.prisma.realProject.count({ where: { moderationStatus: ModerationStatus.PENDING_REVIEW } }),
      this.prisma.realKycDocument.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      overview: {
        totalUsers,
        owners,
        seekers,
        providers,
        totalProperties,
        pendingProperties,
        totalProjects,
        pendingProjects,
        pendingKyc,
      },
    };
  }

  async listPendingProperties() {
    const properties = await this.prisma.realProperty.findMany({
      where: { status: ModerationStatus.PENDING_REVIEW },
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return { properties };
  }

  async moderateProperty(id: string, admin: RequestUser, dto: ModerateListingDto) {
    const property = await this.prisma.realProperty.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');

    const updated = await this.prisma.realProperty.update({
      where: { id },
      data: {
        status: dto.status,
        moderationRemarks: dto.remarks,
        verified: dto.status === ModerationStatus.APPROVED,
      },
    });

    await this.log(admin.id, 'PROPERTY_MODERATED', 'RealProperty', id, dto);
    await this.prisma.realNotification.create({
      data: {
        userId: property.ownerId,
        type: 'MODERATION',
        title: `Listing ${dto.status.replace('_', ' ').toLowerCase()}`,
        body: dto.remarks ?? `Your property "${property.title}" is now ${dto.status}.`,
      },
    });

    return { message: 'Property moderation updated', property: updated };
  }

  async listPendingProjects() {
    const projects = await this.prisma.realProject.findMany({
      where: { moderationStatus: ModerationStatus.PENDING_REVIEW },
      include: { builder: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return { projects };
  }

  async moderateProject(id: string, admin: RequestUser, dto: ModerateListingDto) {
    const project = await this.prisma.realProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');

    const updated = await this.prisma.realProject.update({
      where: { id },
      data: { moderationStatus: dto.status, moderationRemarks: dto.remarks },
    });

    await this.log(admin.id, 'PROJECT_MODERATED', 'RealProject', id, dto);
    await this.prisma.realNotification.create({
      data: {
        userId: project.builderId,
        type: 'MODERATION',
        title: `Project ${dto.status.replace('_', ' ').toLowerCase()}`,
        body: dto.remarks ?? `Your project "${project.name}" is now ${dto.status}.`,
      },
    });

    return { message: 'Project moderation updated', project: updated };
  }

  async listPendingKyc() {
    const documents = await this.prisma.realKycDocument.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { id: true, name: true, email: true, ownerType: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return { documents };
  }

  async reviewKyc(documentId: string, admin: RequestUser, dto: ReviewKycDto) {
    const document = await this.prisma.realKycDocument.findUnique({ where: { id: documentId } });
    if (!document) throw new NotFoundException('KYC document not found');

    const updated = await this.prisma.realKycDocument.update({
      where: { id: documentId },
      data: { status: dto.status, remarks: dto.remarks, reviewedByCentralUserId: admin.centralUserId },
    });

    // Roll the user's overall KYC status up from their latest document decision.
    await this.prisma.realUser.update({
      where: { id: document.userId },
      data: { kycStatus: dto.status },
    });

    await this.log(admin.id, 'KYC_REVIEWED', 'RealKycDocument', documentId, dto);

    await this.prisma.realNotification.create({
      data: {
        userId: document.userId,
        type: 'MODERATION',
        title: `KYC ${dto.status.toLowerCase()}`,
        body: dto.remarks ?? `Your KYC document was marked ${dto.status}.`,
      },
    });

    return { message: 'KYC reviewed', document: updated };
  }

  async listUsers(role?: string) {
    const users = await this.prisma.realUser.findMany({
      where: role ? { roles: { has: role as any } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return { users };
  }

  async setUserActive(userId: string, admin: RequestUser, isActive: boolean) {
    const user = await this.prisma.realUser.update({ where: { id: userId }, data: { isActive } });
    await this.log(admin.id, isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', 'RealUser', userId, {});
    return { message: `User ${isActive ? 'activated' : 'deactivated'}`, user };
  }

  private async log(actorId: string, action: string, entityType: string, entityId: string, metadata: unknown) {
    await this.prisma.realAuditLog.create({
      data: { actorId, action, entityType, entityId, metadata: metadata as any },
    });
  }
}
