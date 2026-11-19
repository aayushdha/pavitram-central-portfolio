import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ModerationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../common/guards/central-auth.guard';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(owner: RequestUser, dto: CreatePropertyDto) {
    const property = await this.prisma.realProperty.create({
      data: { ...dto, ownerId: owner.id },
    });
    return { message: 'Property submitted for review', property };
  }

  /** Public search — only approved, active listings are visible. */
  async findAll(query: QueryPropertyDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);

    const where: Prisma.RealPropertyWhereInput = {
      isActive: true,
      status: ModerationStatus.APPROVED,
      city: query.city ? { equals: query.city, mode: 'insensitive' } : undefined,
      locality: query.locality ? { equals: query.locality, mode: 'insensitive' } : undefined,
      type: query.type,
      intent: query.intent,
      bhk: query.bhk,
      price:
        query.priceMin || query.priceMax
          ? { gte: query.priceMin, lte: query.priceMax }
          : undefined,
      title: query.q ? { contains: query.q, mode: 'insensitive' } : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.realProperty.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { owner: { select: { id: true, name: true, ownerType: true, businessName: true, kycStatus: true } } },
      }),
      this.prisma.realProperty.count({ where }),
    ]);

    return { properties: items, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string) {
    const property = await this.prisma.realProperty.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, phone: true, ownerType: true, businessName: true, kycStatus: true } } },
    });
    if (!property) throw new NotFoundException('Property not found');

    await this.prisma.realProperty.update({ where: { id }, data: { views: { increment: 1 } } });
    return { property };
  }

  /** Properties owned by the currently authenticated OWNER (any status). */
  async findMine(ownerId: string) {
    const properties = await this.prisma.realProperty.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
    return { properties };
  }

  async update(id: string, requester: RequestUser, dto: UpdatePropertyDto) {
    const property = await this.assertOwnership(id, requester);
    const updated = await this.prisma.realProperty.update({
      where: { id: property.id },
      data: {
        ...dto,
        // Any edit sends it back for re-review unless an admin is editing.
        status: requester.roles.includes('ADMIN' as any)
          ? property.status
          : ModerationStatus.PENDING_REVIEW,
      },
    });
    return { message: 'Property updated', property: updated };
  }

  async remove(id: string, requester: RequestUser) {
    const property = await this.assertOwnership(id, requester);
    await this.prisma.realProperty.delete({ where: { id: property.id } });
    return { message: 'Property deleted' };
  }

  private async assertOwnership(id: string, requester: RequestUser) {
    const property = await this.prisma.realProperty.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    const isAdmin = requester.roles.includes('ADMIN' as any);
    if (property.ownerId !== requester.id && !isAdmin) {
      throw new ForbiddenException('You do not own this property');
    }
    return property;
  }
}
