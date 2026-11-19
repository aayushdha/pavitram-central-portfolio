import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationRuleDto } from './dto/create-notification-rule.dto';
import { UpdateNotificationRuleDto } from './dto/update-notification-rule.dto';

@Injectable()
export class NotificationRulesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateNotificationRuleDto) {
    return this.prisma.notificationRule.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { audience: { contains: search, mode: 'insensitive' } },
              { trigger: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.notificationRule.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notificationRule.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.notificationRule.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`NotificationRule ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateNotificationRuleDto) {
    await this.findOne(id);
    return this.prisma.notificationRule.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.notificationRule.delete({ where: { id } });
    return { success: true };
  }
}
