import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TierPricingDto } from './dto/tier-pricing.dto';

@Injectable()
export class TierPricingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForProduct(productId: string) {
    await this.ensureProduct(productId);
    return this.prisma.productTierPricing.findMany({ where: { productId }, orderBy: { min: 'asc' } });
  }

  async create(productId: string, dto: TierPricingDto) {
    await this.ensureProduct(productId);
    return this.prisma.productTierPricing.create({
      data: { productId, min: dto.min, max: dto.max ?? null, price: dto.price },
    });
  }

  async update(productId: string, tierId: string, dto: Partial<TierPricingDto>) {
    await this.ensureTier(productId, tierId);
    return this.prisma.productTierPricing.update({ where: { id: tierId }, data: dto });
  }

  async remove(productId: string, tierId: string) {
    await this.ensureTier(productId, tierId);
    await this.prisma.productTierPricing.delete({ where: { id: tierId } });
    return { success: true };
  }

  private async ensureProduct(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    return product;
  }

  private async ensureTier(productId: string, tierId: string) {
    await this.ensureProduct(productId);
    const tier = await this.prisma.productTierPricing.findFirst({ where: { id: tierId, productId } });
    if (!tier) throw new NotFoundException(`Tier pricing slab ${tierId} not found for product ${productId}`);
    return tier;
  }
}
