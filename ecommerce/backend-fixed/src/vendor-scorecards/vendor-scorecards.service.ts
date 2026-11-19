import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorScorecardDto } from './dto/create-vendor-scorecard.dto';
import { UpdateVendorScorecardDto } from './dto/update-vendor-scorecard.dto';

@Injectable()
export class VendorScorecardsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVendorScorecardDto) {
    return this.prisma.vendorScorecard.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { vendor: { contains: search, mode: 'insensitive' } },
              { rfqResponse: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.vendorScorecard.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vendorScorecard.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.vendorScorecard.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`VendorScorecard ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateVendorScorecardDto) {
    await this.findOne(id);
    return this.prisma.vendorScorecard.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.vendorScorecard.delete({ where: { id } });
    return { success: true };
  }
}
