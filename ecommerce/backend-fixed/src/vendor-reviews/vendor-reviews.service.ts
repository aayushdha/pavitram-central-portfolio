import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorReviewDto } from './dto/create-vendor-review.dto';
import { UpdateVendorReviewDto } from './dto/update-vendor-review.dto';

@Injectable()
export class VendorReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVendorReviewDto) {
    return this.prisma.vendorReview.create({ data: dto });
  }

  async findAll(params: { vendorId?: string; search?: string; page?: number; limit?: number } = {}) {
    const { vendorId, search, page = 1, limit = 50 } = params;
    const where: any = {
      ...(vendorId ? { vendorId } : {}),
      ...(search
        ? {
            OR: [
              { from: { contains: search, mode: 'insensitive' } },
              { note: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.vendorReview.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vendorReview.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.vendorReview.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Vendor review ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateVendorReviewDto) {
    await this.findOne(id);
    return this.prisma.vendorReview.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.vendorReview.delete({ where: { id } });
    return { success: true };
  }
}
