import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { UpdateReturnRequestDto } from './dto/update-return-request.dto';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateReturnRequestDto) {
    return this.prisma.returnRequest.create({ data: dto });
  }

  async findAll(params: { orderId?: string; userId?: string; status?: string; page?: number; limit?: number } = {}) {
    const { orderId, userId, status, page = 1, limit = 50 } = params;
    const where: any = {
      ...(orderId ? { orderId } : {}),
      ...(userId ? { userId } : {}),
      ...(status ? { status } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.returnRequest.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.returnRequest.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.returnRequest.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Return request ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateReturnRequestDto) {
    await this.findOne(id);
    return this.prisma.returnRequest.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.returnRequest.delete({ where: { id } });
    return { success: true };
  }
}
