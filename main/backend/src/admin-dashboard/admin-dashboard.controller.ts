import { Controller, Get, UseGuards } from "@nestjs/common";
import { MainRole } from "@prisma/client";
import { AdminDashboardService } from "./admin-dashboard.service";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@Controller("admin/dashboard")
@UseGuards(RolesGuard)
@Roles(MainRole.ADMIN, MainRole.SUPER_ADMIN)
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get("stats")
  getStats() {
    return this.dashboardService.getStats();
  }
}
