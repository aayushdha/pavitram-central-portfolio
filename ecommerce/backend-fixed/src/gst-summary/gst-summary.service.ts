import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGstSummaryDto } from './dto/create-gst-summary.dto';
import { UpdateGstSummaryDto } from './dto/update-gst-summary.dto';

@Injectable()
export class GstSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateGstSummaryDto) {
    return this.prisma.gstSummary.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { state: { contains: search, mode: 'insensitive' } },
              { hsn: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.gstSummary.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.gstSummary.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.gstSummary.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`GstSummary ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateGstSummaryDto) {
    await this.findOne(id);
    return this.prisma.gstSummary.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.gstSummary.delete({ where: { id } });
    return { success: true };
  }
}
