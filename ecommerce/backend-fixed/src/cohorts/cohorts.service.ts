import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';

@Injectable()
export class CohortsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCohortDto) {
    return this.prisma.cohort.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { segment: { contains: search, mode: 'insensitive' } },
              { retail: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.cohort.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.cohort.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.cohort.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Cohort ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateCohortDto) {
    await this.findOne(id);
    return this.prisma.cohort.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.cohort.delete({ where: { id } });
    return { success: true };
  }
}
