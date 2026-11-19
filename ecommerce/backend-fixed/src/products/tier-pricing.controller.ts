import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TierPricingService } from './tier-pricing.service';
import { TierPricingDto } from './dto/tier-pricing.dto';

@ApiTags('products / tier-pricing')
@Controller('products/:productId/tier-pricing')
export class TierPricingController {
  constructor(private readonly service: TierPricingService) {}

  @Get()
  @ApiOperation({ summary: 'List quantity-slab price tiers for a product' })
  findAll(@Param('productId') productId: string) {
    return this.service.findAllForProduct(productId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a single quantity-slab price tier to a product' })
  create(@Param('productId') productId: string, @Body() dto: TierPricingDto) {
    return this.service.create(productId, dto);
  }

  @Patch(':tierId')
  update(@Param('productId') productId: string, @Param('tierId') tierId: string, @Body() dto: TierPricingDto) {
    return this.service.update(productId, tierId, dto);
  }

  @Delete(':tierId')
  remove(@Param('productId') productId: string, @Param('tierId') tierId: string) {
    return this.service.remove(productId, tierId);
  }
}
