import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommissionRuleDto } from './dto/create-commission-rule.dto';
import { UpdateCommissionRuleDto } from './dto/update-commission-rule.dto';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';

@Injectable()
export class CommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- Rules ----------------
  createRule(dto: CreateCommissionRuleDto) {
    return this.prisma.commissionRule.create({ data: dto });
  }

  async findAllRules(params: { scope?: string; channel?: string; page?: number; limit?: number } = {}) {
    const { scope, channel, page = 1, limit = 50 } = params;
    const where: any = { ...(scope ? { scope } : {}), ...(channel ? { channel } : {}) };
    const [data, total] = await Promise.all([
      this.prisma.commissionRule.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.commissionRule.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOneRule(id: string) {
    const rule = await this.prisma.commissionRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException(`Commission rule ${id} not found`);
    return rule;
  }

  async updateRule(id: string, dto: UpdateCommissionRuleDto) {
    await this.findOneRule(id);
    return this.prisma.commissionRule.update({ where: { id }, data: dto });
  }

  async removeRule(id: string) {
    await this.findOneRule(id);
    await this.prisma.commissionRule.delete({ where: { id } });
    return { success: true };
  }

  // Given a sale, work out the most specific applicable commission rate.
  // Priority: product > vendor > category > global. Within B2B, slabs
  // (minOrderValue/maxOrderValue) narrow the match further.
  async resolveRate(params: { vendorId?: string; category?: string; productId?: string; channel: string; orderValue: number }) {
    const rules = await this.prisma.commissionRule.findMany({ where: { active: true } });
    const candidates = rules.filter((r) => {
      if (r.channel !== 'Both' && r.channel !== params.channel) return false;
      if (r.minOrderValue != null && params.orderValue < r.minOrderValue) return false;
      if (r.maxOrderValue != null && params.orderValue > r.maxOrderValue) return false;
      if (r.scope === 'product') return r.scopeRef === params.productId;
      if (r.scope === 'vendor') return r.scopeRef === params.vendorId;
      if (r.scope === 'category') return r.scopeRef === params.category;
      return r.scope === 'global';
    });
    const specificityOrder = ['product', 'vendor', 'category', 'global'];
    candidates.sort((a, b) => specificityOrder.indexOf(a.scope) - specificityOrder.indexOf(b.scope));
    const rule = candidates[0];
    if (!rule) return { rule: null, commission: 0 };
    const commission = rule.type === 'flat' ? rule.value : (params.orderValue * rule.value) / 100;
    return { rule, commission };
  }

  // ---------------- Payouts ----------------
  createPayout(dto: CreatePayoutDto) {
    return this.prisma.payout.create({ data: dto });
  }

  async findAllPayouts(params: { vendorId?: string; status?: string; page?: number; limit?: number } = {}) {
    const { vendorId, status, page = 1, limit = 50 } = params;
    const where: any = { ...(vendorId ? { vendorId } : {}), ...(status ? { status } : {}) };
    const [data, total] = await Promise.all([
      this.prisma.payout.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.payout.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOnePayout(id: string) {
    const record = await this.prisma.payout.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Payout ${id} not found`);
    return record;
  }

  async updatePayout(id: string, dto: UpdatePayoutDto) {
    await this.findOnePayout(id);
    const data: any = { ...dto };
    if (dto.status === 'Paid') data.paidAt = new Date();
    return this.prisma.payout.update({ where: { id }, data });
  }

  async removePayout(id: string) {
    await this.findOnePayout(id);
    await this.prisma.payout.delete({ where: { id } });
    return { success: true };
  }
}
