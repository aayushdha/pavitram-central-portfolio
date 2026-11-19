import { Module } from '@nestjs/common';
import { VendorScorecardsController } from './vendor-scorecards.controller';
import { VendorScorecardsService } from './vendor-scorecards.service';

@Module({
  controllers: [VendorScorecardsController],
  providers: [VendorScorecardsService],
})
export class VendorScorecardsModule {}
