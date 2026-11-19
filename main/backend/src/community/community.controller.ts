import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { MainCommunityStatus, MainRole } from "@prisma/client";
import { CommunityService } from "./community.service";
import { UpdateCommunityStatusDto } from "./dto/update-community-status.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("admin/community-members")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: MainCommunityStatus,
    @Query("search") search?: string,
  ) {
    return this.communityService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      search,
    });
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.communityService.get(id);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateCommunityStatusDto,
    @CurrentUser("userId") adminId: string,
  ) {
    return this.communityService.updateStatus(id, dto, adminId);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.communityService.remove(id);
  }
}
