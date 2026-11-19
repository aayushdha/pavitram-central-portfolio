import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { UpdateCreditNoteDto } from './dto/update-credit-note.dto';

@Injectable()
export class CreditNotesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCreditNoteDto) {
    return this.prisma.creditNote.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { against: { contains: search, mode: 'insensitive' } },
              { orderId: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.creditNote.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.creditNote.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.creditNote.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`CreditNote ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateCreditNoteDto) {
    await this.findOne(id);
    return this.prisma.creditNote.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.creditNote.delete({ where: { id } });
    return { success: true };
  }
}
