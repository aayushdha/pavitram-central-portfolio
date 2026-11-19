import { Module } from '@nestjs/common';
import { HeroStatsController } from './hero-stats.controller';
import { HeroStatsService } from './hero-stats.service';

@Module({
  controllers: [HeroStatsController],
  providers: [HeroStatsService],
})
export class HeroStatsModule {}
