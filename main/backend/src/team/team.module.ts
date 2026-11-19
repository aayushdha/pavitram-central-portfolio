import { Module } from "@nestjs/common";
import { TeamService } from "./team.service";
import { TeamController, AdminTeamController } from "./team.controller";

@Module({
  controllers: [TeamController, AdminTeamController],
  providers: [TeamService],
})
export class TeamModule {}
