import { Module } from '@nestjs/common';
import { ContractPricingController } from './contract-pricing.controller';
import { ContractPricingService } from './contract-pricing.service';

@Module({
  controllers: [ContractPricingController],
  providers: [ContractPricingService],
})
export class ContractPricingModule {}
