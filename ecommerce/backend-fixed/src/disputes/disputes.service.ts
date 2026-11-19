import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateDisputeDto) {
    return this.prisma.dispute.create({ data: dto });
  }

  async findAll(params: { orderId?: string; stage?: string; search?: string; page?: number; limit?: number } = {}) {
    const { orderId, stage, search, page = 1, limit = 50 } = params;
    const where: any = {
      ...(orderId ? { orderId } : {}),
      ...(stage ? { stage } : {}),
      ...(search
        ? {
            OR: [
              { orderId: { contains: search, mode: 'insensitive' } },
              { against: { contains: search, mode: 'insensitive' } },
              { type: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.dispute.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.dispute.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Dispute ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateDisputeDto) {
    await this.findOne(id);
    return this.prisma.dispute.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.dispute.delete({ where: { id } });
    return { success: true };
  }
}
