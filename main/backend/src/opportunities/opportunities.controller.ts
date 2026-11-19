import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { MainRole } from "@prisma/client";
import { OpportunitiesService } from "./opportunities.service";
import { CreateOpportunityDto } from "./dto/create-opportunity.dto";
import { UpdateOpportunityDto } from "./dto/update-opportunity.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("opportunities")
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Public()
  @Get()
  findAll() {
    return this.opportunitiesService.findAllPublic();
  }

  @Public()
  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.opportunitiesService.findOnePublic(slug);
  }
}

@Controller("admin/opportunities")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class AdminOpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  findAll() {
    return this.opportunitiesService.findAllAdmin();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.opportunitiesService.findOneAdmin(id);
  }

  @Post()
  create(@Body() dto: CreateOpportunityDto) {
    return this.opportunitiesService.create(dto);
  }

  @Patch("reorder")
  reorder(@Body("items") items: { id: string; order: number }[]) {
    return this.opportunitiesService.reorder(items);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateOpportunityDto) {
    return this.opportunitiesService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.opportunitiesService.remove(id);
  }
}
