import { Module } from '@nestjs/common';
import { GmvTrendsController } from './gmv-trends.controller';
import { GmvTrendsService } from './gmv-trends.service';

@Module({
  controllers: [GmvTrendsController],
  providers: [GmvTrendsService],
})
export class GmvTrendsModule {}
