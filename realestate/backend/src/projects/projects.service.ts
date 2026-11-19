import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ModerationStatus, Prisma } from '@prisma/client';
import { RequestUser } from '../common/guards/central-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(builder: RequestUser, dto: CreateProjectDto) {
    const { units, ...rest } = dto;
    const project = await this.prisma.realProject.create({
      data: {
        ...rest,
        builderId: builder.id,
        units: units?.length ? { createMany: { data: units } } : undefined,
      },
      include: { units: true },
    });
    return { message: 'Project submitted for review', project };
  }

  async findAll(query: QueryProjectDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const where: Prisma.RealProjectWhereInput = {
      isActive: true,
      moderationStatus: ModerationStatus.APPROVED,
      city: query.city ? { equals: query.city, mode: 'insensitive' } : undefined,
      locality: query.locality ? { equals: query.locality, mode: 'insensitive' } : undefined,
      type: query.type,
      status: query.status,
      name: query.q ? { contains: query.q, mode: 'insensitive' } : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.realProject.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { units: true, builder: { select: { id: true, name: true, businessName: true, kycStatus: true } } },
      }),
      this.prisma.realProject.count({ where }),
    ]);

    return { projects: items, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string) {
    const project = await this.prisma.realProject.findUnique({
      where: { id },
      include: { units: true, builder: { select: { id: true, name: true, businessName: true, kycStatus: true, phone: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    return { project };
  }

  async findMine(builderId: string) {
    const projects = await this.prisma.realProject.findMany({
      where: { builderId },
      include: { units: true },
      orderBy: { createdAt: 'desc' },
    });
    return { projects };
  }

  async update(id: string, requester: RequestUser, dto: UpdateProjectDto) {
    const project = await this.assertOwnership(id, requester);
    const { units, ...rest } = dto;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (units) {
        await tx.realProjectUnit.deleteMany({ where: { projectId: project.id } });
      }
      return tx.realProject.update({
        where: { id: project.id },
        data: {
          ...rest,
          moderationStatus: requester.roles.includes('ADMIN' as any)
            ? project.moderationStatus
            : ModerationStatus.PENDING_REVIEW,
          units: units?.length ? { createMany: { data: units } } : undefined,
        },
        include: { units: true },
      });
    });

    return { message: 'Project updated', project: updated };
  }

  async remove(id: string, requester: RequestUser) {
    const project = await this.assertOwnership(id, requester);
    await this.prisma.realProject.delete({ where: { id: project.id } });
    return { message: 'Project deleted' };
  }

  private async assertOwnership(id: string, requester: RequestUser) {
    const project = await this.prisma.realProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    const isAdmin = requester.roles.includes('ADMIN' as any);
    if (project.builderId !== requester.id && !isAdmin) {
      throw new ForbiddenException('You do not own this project');
    }
    return project;
  }
}
