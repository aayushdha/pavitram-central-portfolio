import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { MainRole } from "@prisma/client";
import { StatsService } from "./stats.service";
import { CreateStatDto } from "./dto/create-stat.dto";
import { UpdateStatDto } from "./dto/update-stat.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Public()
  @Get()
  findAll() {
    return this.statsService.findAllPublic();
  }
}

@Controller("admin/stats")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class AdminStatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  findAll() {
    return this.statsService.findAllAdmin();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.statsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateStatDto) {
    return this.statsService.create(dto);
  }

  @Patch("reorder")
  reorder(@Body("items") items: { id: string; order: number }[]) {
    return this.statsService.reorder(items);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateStatDto) {
    return this.statsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.statsService.remove(id);
  }
}
