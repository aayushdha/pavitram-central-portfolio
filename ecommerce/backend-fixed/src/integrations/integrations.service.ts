import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateIntegrationDto) {
    return this.prisma.integration.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.integration.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.integration.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.integration.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Integration ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateIntegrationDto) {
    await this.findOne(id);
    return this.prisma.integration.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.integration.delete({ where: { id } });
    return { success: true };
  }
}
