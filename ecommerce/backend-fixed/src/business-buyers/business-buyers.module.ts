import { Module } from '@nestjs/common';
import { BusinessBuyersController } from './business-buyers.controller';
import { BusinessBuyersService } from './business-buyers.service';

@Module({
  controllers: [BusinessBuyersController],
  providers: [BusinessBuyersService],
})
export class BusinessBuyersModule {}
