import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSampleOrderDto } from './dto/create-sample-order.dto';
import { UpdateSampleOrderDto } from './dto/update-sample-order.dto';

@Injectable()
export class SampleOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSampleOrderDto) {
    return this.prisma.sampleOrder.create({ data: dto });
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
      this.prisma.sampleOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sampleOrder.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.sampleOrder.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`SampleOrder ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateSampleOrderDto) {
    await this.findOne(id);
    return this.prisma.sampleOrder.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.sampleOrder.delete({ where: { id } });
    return { success: true };
  }
}
