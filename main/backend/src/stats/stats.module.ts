import { Module } from "@nestjs/common";
import { StatsService } from "./stats.service";
import { StatsController, AdminStatsController } from "./stats.controller";

@Module({
  controllers: [StatsController, AdminStatsController],
  providers: [StatsService],
})
export class StatsModule {}
