import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTeamMemberDto) {
    return this.prisma.teamMember.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { role: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.teamMember.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.teamMember.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`TeamMember ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateTeamMemberDto) {
    await this.findOne(id);
    return this.prisma.teamMember.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.teamMember.delete({ where: { id } });
    return { success: true };
  }
}
