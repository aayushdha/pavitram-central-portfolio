import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Injectable()
export class LanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLanguageDto) {
    return this.prisma.language.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.language.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.language.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.language.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Language ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateLanguageDto) {
    await this.findOne(id);
    return this.prisma.language.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.language.delete({ where: { id } });
    return { success: true };
  }
}
