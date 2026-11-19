import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedAddressDto } from './dto/create-saved-address.dto';
import { UpdateSavedAddressDto } from './dto/update-saved-address.dto';

@Injectable()
export class SavedAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSavedAddressDto) {
    return this.prisma.savedAddress.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { userId: { contains: search, mode: 'insensitive' } },
              { label: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.savedAddress.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.savedAddress.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.savedAddress.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`SavedAddress ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateSavedAddressDto) {
    await this.findOne(id);
    return this.prisma.savedAddress.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.savedAddress.delete({ where: { id } });
    return { success: true };
  }
}
