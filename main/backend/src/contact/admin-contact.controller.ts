import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { MainMessageStatus, MainRole } from "@prisma/client";
import { ContactService } from "./contact.service";
import { UpdateContactStatusDto } from "./dto/update-contact-status.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("admin/contact-messages")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class AdminContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: MainMessageStatus,
    @Query("search") search?: string,
  ) {
    return this.contactService.list({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      search,
    });
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.contactService.get(id);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateContactStatusDto,
    @CurrentUser("userId") adminId: string,
  ) {
    return this.contactService.updateStatus(id, dto, adminId);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.contactService.remove(id);
  }
}
