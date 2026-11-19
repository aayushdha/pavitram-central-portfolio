import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { UpdateRfqDto } from './dto/update-rfq.dto';

@Injectable()
export class RfqsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRfqDto) {
    return this.prisma.rfq.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { buyer: { contains: search, mode: 'insensitive' } },
              { product: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.rfq.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.rfq.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.rfq.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Rfq ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateRfqDto) {
    await this.findOne(id);
    return this.prisma.rfq.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.rfq.delete({ where: { id } });
    return { success: true };
  }
}
