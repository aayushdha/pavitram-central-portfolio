import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGmvTrendDto } from './dto/create-gmv-trend.dto';
import { UpdateGmvTrendDto } from './dto/update-gmv-trend.dto';

@Injectable()
export class GmvTrendsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateGmvTrendDto) {
    return this.prisma.gmvTrend.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { month: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.gmvTrend.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.gmvTrend.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.gmvTrend.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`GmvTrend ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateGmvTrendDto) {
    await this.findOne(id);
    return this.prisma.gmvTrend.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.gmvTrend.delete({ where: { id } });
    return { success: true };
  }
}
