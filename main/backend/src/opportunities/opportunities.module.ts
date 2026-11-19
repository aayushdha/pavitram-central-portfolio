import { Module } from "@nestjs/common";
import { OpportunitiesService } from "./opportunities.service";
import { OpportunitiesController, AdminOpportunitiesController } from "./opportunities.controller";

@Module({
  controllers: [OpportunitiesController, AdminOpportunitiesController],
  providers: [OpportunitiesService],
})
export class OpportunitiesModule {}
