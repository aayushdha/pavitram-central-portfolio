import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';

@Injectable()
export class SavedSearchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSavedSearchDto) {
    const savedSearch = await this.prisma.realSavedSearch.create({
      data: { userId, name: dto.name, filters: dto.filters as any, alertsEnabled: dto.alertsEnabled ?? true },
    });
    return { message: 'Search saved', savedSearch };
  }

  async findMine(userId: string) {
    const savedSearches = await this.prisma.realSavedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { savedSearches };
  }

  async remove(id: string, userId: string) {
    const search = await this.prisma.realSavedSearch.findUnique({ where: { id } });
    if (!search) throw new NotFoundException('Saved search not found');
    if (search.userId !== userId) throw new ForbiddenException('Not your saved search');
    await this.prisma.realSavedSearch.delete({ where: { id } });
    return { message: 'Saved search deleted' };
  }
}
