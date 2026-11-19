import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSecuritySettingDto } from './dto/create-security-setting.dto';
import { UpdateSecuritySettingDto } from './dto/update-security-setting.dto';

@Injectable()
export class SecuritySettingsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSecuritySettingDto) {
    return this.prisma.securitySetting.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { control: { contains: search, mode: 'insensitive' } },
              { scope: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.securitySetting.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.securitySetting.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.securitySetting.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`SecuritySetting ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateSecuritySettingDto) {
    await this.findOne(id);
    return this.prisma.securitySetting.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.securitySetting.delete({ where: { id } });
    return { success: true };
  }
}
