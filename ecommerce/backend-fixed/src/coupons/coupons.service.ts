import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { type: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.coupon.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(code: string) {
    const record = await this.prisma.coupon.findUnique({ where: { code } });
    if (!record) throw new NotFoundException(`Coupon ${code} not found`);
    return record;
  }

  async update(code: string, dto: UpdateCouponDto) {
    await this.findOne(code);
    return this.prisma.coupon.update({ where: { code }, data: dto });
  }

  async remove(code: string) {
    await this.findOne(code);
    await this.prisma.coupon.delete({ where: { code } });
    return { success: true };
  }
}
