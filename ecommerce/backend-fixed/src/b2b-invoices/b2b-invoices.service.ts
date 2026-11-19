import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateB2bInvoiceDto } from './dto/create-b2b-invoice.dto';
import { UpdateB2bInvoiceDto } from './dto/update-b2b-invoice.dto';

@Injectable()
export class B2bInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateB2bInvoiceDto) {
    return this.prisma.b2bInvoice.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { period: { contains: search, mode: 'insensitive' } },
              { status: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.b2bInvoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.b2bInvoice.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.b2bInvoice.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`B2bInvoice ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateB2bInvoiceDto) {
    await this.findOne(id);
    return this.prisma.b2bInvoice.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.b2bInvoice.delete({ where: { id } });
    return { success: true };
  }
}
