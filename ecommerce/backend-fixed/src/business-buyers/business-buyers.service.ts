import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessBuyerDto } from './dto/create-business-buyer.dto';
import { UpdateBusinessBuyerDto } from './dto/update-business-buyer.dto';

@Injectable()
export class BusinessBuyersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBusinessBuyerDto) {
    return this.prisma.businessBuyer.create({ data: dto });
  }

  async findAll(params: { search?: string; segment?: string; status?: string; page?: number; limit?: number } = {}) {
    const { search, segment, status, page = 1, limit = 20 } = params;
    const where: any = {
      ...(segment ? { segment } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { company: { contains: search, mode: 'insensitive' } },
              { gstin: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.businessBuyer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { teamMembers: true },
      }),
      this.prisma.businessBuyer.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.businessBuyer.findUnique({ where: { id }, include: { teamMembers: true } });
    if (!record) throw new NotFoundException(`Business buyer ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateBusinessBuyerDto) {
    await this.findOne(id);
    return this.prisma.businessBuyer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.businessBuyer.delete({ where: { id } });
    return { success: true };
  }
}
