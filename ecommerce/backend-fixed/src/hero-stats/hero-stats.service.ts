import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHeroStatDto } from './dto/create-hero-stat.dto';
import { UpdateHeroStatDto } from './dto/update-hero-stat.dto';

@Injectable()
export class HeroStatsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateHeroStatDto) {
    return this.prisma.heroStat.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { label: { contains: search, mode: 'insensitive' } },
              { value: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.heroStat.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.heroStat.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.heroStat.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`HeroStat ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateHeroStatDto) {
    await this.findOne(id);
    return this.prisma.heroStat.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.heroStat.delete({ where: { id } });
    return { success: true };
  }
}
