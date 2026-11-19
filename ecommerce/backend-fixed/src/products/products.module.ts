import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TierPricingController } from './tier-pricing.controller';
import { TierPricingService } from './tier-pricing.service';

@Module({
  controllers: [ProductsController, TierPricingController],
  providers: [ProductsService, TierPricingService],
})
export class ProductsModule {}
