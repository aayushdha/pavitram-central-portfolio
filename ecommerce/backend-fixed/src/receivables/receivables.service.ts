import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';

@Injectable()
export class ReceivablesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateReceivableDto) {
    return this.prisma.receivable.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { buyer: { contains: search, mode: 'insensitive' } },
              { terms: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.receivable.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.receivable.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.receivable.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Receivable ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateReceivableDto) {
    await this.findOne(id);
    return this.prisma.receivable.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.receivable.delete({ where: { id } });
    return { success: true };
  }
}
