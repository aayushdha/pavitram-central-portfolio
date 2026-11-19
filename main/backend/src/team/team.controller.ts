import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { MainRole } from "@prisma/client";
import { TeamService } from "./team.service";
import { CreateTeamMemberDto } from "./dto/create-team-member.dto";
import { UpdateTeamMemberDto } from "./dto/update-team-member.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("team")
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Public()
  @Get()
  findAll() {
    return this.teamService.findAllPublic();
  }
}

@Controller("admin/team")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class AdminTeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  findAll() {
    return this.teamService.findAllAdmin();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.teamService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTeamMemberDto) {
    return this.teamService.create(dto);
  }

  @Patch("reorder")
  reorder(@Body("items") items: { id: string; order: number }[]) {
    return this.teamService.reorder(items);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.teamService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.teamService.remove(id);
  }
}
