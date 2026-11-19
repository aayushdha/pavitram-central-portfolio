import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../common/guards/central-auth.guard';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * A seeker enquiring on a property creates a lead for that property's
   * owner. Anyone authenticated can do this (they don't need the OWNER role
   * themselves — they're enquiring about someone else's listing).
   */
  async create(seeker: RequestUser, dto: CreateLeadDto) {
    let ownerId: string | undefined;
    if (dto.propertyId) {
      const property = await this.prisma.realProperty.findUnique({ where: { id: dto.propertyId } });
      if (!property) throw new NotFoundException('Property not found');
      ownerId = property.ownerId;
      await this.prisma.realProperty.update({
        where: { id: property.id },
        data: { inquiries: { increment: 1 } },
      });
    }
    if (!ownerId) {
      throw new NotFoundException('A valid propertyId is required to route this lead to its owner');
    }

    const lead = await this.prisma.realLead.create({
      data: {
        ownerId,
        seekerId: seeker.id,
        propertyId: dto.propertyId,
        name: dto.name,
        phone: dto.phone,
        notes: dto.notes,
        intentScore: dto.intentScore ?? 50,
      },
    });

    await this.prisma.realNotification.create({
      data: {
        userId: ownerId,
        type: 'LEAD',
        title: 'New enquiry received',
        body: `${dto.name} enquired about your listing.`,
      },
    });

    return { message: 'Enquiry sent', lead };
  }

  async findMine(ownerId: string, stage?: string) {
    const leads = await this.prisma.realLead.findMany({
      where: { ownerId, stage: stage as any },
      include: { property: { select: { id: true, title: true } } },
      orderBy: { lastActivityAt: 'desc' },
    });
    return { leads };
  }

  async update(id: string, requester: RequestUser, dto: UpdateLeadDto) {
    const lead = await this.assertOwnership(id, requester);
    const updated = await this.prisma.realLead.update({
      where: { id: lead.id },
      data: { ...dto, lastActivityAt: new Date() },
    });
    return { message: 'Lead updated', lead: updated };
  }

  async remove(id: string, requester: RequestUser) {
    const lead = await this.assertOwnership(id, requester);
    await this.prisma.realLead.delete({ where: { id: lead.id } });
    return { message: 'Lead deleted' };
  }

  private async assertOwnership(id: string, requester: RequestUser) {
    const lead = await this.prisma.realLead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    const isAdmin = requester.roles.includes('ADMIN' as any);
    if (lead.ownerId !== requester.id && !isAdmin) {
      throw new ForbiddenException('This lead does not belong to you');
    }
    return lead;
  }
}
