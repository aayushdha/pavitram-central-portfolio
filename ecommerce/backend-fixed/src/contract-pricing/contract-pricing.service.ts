import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractPricingDto } from './dto/create-contract-pricing.dto';
import { UpdateContractPricingDto } from './dto/update-contract-pricing.dto';

@Injectable()
export class ContractPricingService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateContractPricingDto) {
    return this.prisma.contractPricing.create({ data: dto });
  }

  async findAll(params: { search?: string; page?: number; limit?: number } = {}) {
    const { search, page = 1, limit = 50 } = params;
    const where: any = search
      ? {
          OR: [
              { buyer: { contains: search, mode: 'insensitive' } },
              { product: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const [data, total] = await Promise.all([
      this.prisma.contractPricing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contractPricing.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const record = await this.prisma.contractPricing.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`ContractPricing ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateContractPricingDto) {
    await this.findOne(id);
    return this.prisma.contractPricing.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contractPricing.delete({ where: { id } });
    return { success: true };
  }
}
