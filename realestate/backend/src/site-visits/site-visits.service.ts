import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../common/guards/central-auth.guard';
import { CreateSiteVisitDto } from './dto/create-site-visit.dto';
import { UpdateSiteVisitDto } from './dto/update-site-visit.dto';

@Injectable()
export class SiteVisitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(seeker: RequestUser, dto: CreateSiteVisitDto) {
    if (!dto.propertyId && !dto.projectId) {
      throw new NotFoundException('Provide either propertyId or projectId');
    }

    let hostId: string;
    if (dto.propertyId) {
      const property = await this.prisma.realProperty.findUnique({ where: { id: dto.propertyId } });
      if (!property) throw new NotFoundException('Property not found');
      hostId = property.ownerId;
    } else {
      const project = await this.prisma.realProject.findUnique({ where: { id: dto.projectId } });
      if (!project) throw new NotFoundException('Project not found');
      hostId = project.builderId;
    }

    const siteVisit = await this.prisma.realSiteVisit.create({
      data: {
        seekerId: seeker.id,
        hostId,
        propertyId: dto.propertyId,
        projectId: dto.projectId,
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes,
      },
    });

    await this.prisma.realNotification.create({
      data: {
        userId: hostId,
        type: 'SITE_VISIT',
        title: 'New site visit request',
        body: `A visitor requested a site visit on ${new Date(dto.scheduledAt).toLocaleString()}.`,
      },
    });

    return { message: 'Site visit requested', siteVisit };
  }

  async findMineAsSeeker(seekerId: string) {
    const siteVisits = await this.prisma.realSiteVisit.findMany({
      where: { seekerId },
      include: { property: { select: { id: true, title: true } }, project: { select: { id: true, name: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
    return { siteVisits };
  }

  async findMineAsHost(hostId: string) {
    const siteVisits = await this.prisma.realSiteVisit.findMany({
      where: { hostId },
      include: { property: { select: { id: true, title: true } }, project: { select: { id: true, name: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
    return { siteVisits };
  }

  async update(id: string, requester: RequestUser, dto: UpdateSiteVisitDto) {
    const siteVisit = await this.prisma.realSiteVisit.findUnique({ where: { id } });
    if (!siteVisit) throw new NotFoundException('Site visit not found');

    const isAdmin = requester.roles.includes('ADMIN' as any);
    const isParty = siteVisit.hostId === requester.id || siteVisit.seekerId === requester.id;
    if (!isParty && !isAdmin) throw new ForbiddenException('You are not part of this site visit');

    const updated = await this.prisma.realSiteVisit.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
    return { message: 'Site visit updated', siteVisit: updated };
  }
}
