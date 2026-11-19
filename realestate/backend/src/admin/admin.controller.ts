import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RealRole } from '@prisma/client';
import { CentralAuthGuard, RequestUser } from '../common/guards/central-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { ModerateListingDto } from './dto/moderate-listing.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(CentralAuthGuard, RolesGuard)
@Roles(RealRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  overview() {
    return this.adminService.overview();
  }

  @Get('properties/pending')
  listPendingProperties() {
    return this.adminService.listPendingProperties();
  }

  @Patch('properties/:id/moderate')
  moderateProperty(
    @Param('id') id: string,
    @CurrentUser() admin: RequestUser,
    @Body() dto: ModerateListingDto,
  ) {
    return this.adminService.moderateProperty(id, admin, dto);
  }

  @Get('projects/pending')
  listPendingProjects() {
    return this.adminService.listPendingProjects();
  }

  @Patch('projects/:id/moderate')
  moderateProject(
    @Param('id') id: string,
    @CurrentUser() admin: RequestUser,
    @Body() dto: ModerateListingDto,
  ) {
    return this.adminService.moderateProject(id, admin, dto);
  }

  @Get('kyc/pending')
  listPendingKyc() {
    return this.adminService.listPendingKyc();
  }

  @Patch('kyc/:documentId/review')
  reviewKyc(
    @Param('documentId') documentId: string,
    @CurrentUser() admin: RequestUser,
    @Body() dto: ReviewKycDto,
  ) {
    return this.adminService.reviewKyc(documentId, admin, dto);
  }

  @Get('users')
  listUsers(@Query('role') role?: string) {
    return this.adminService.listUsers(role);
  }

  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string, @CurrentUser() admin: RequestUser) {
    return this.adminService.setUserActive(id, admin, true);
  }

  @Patch('users/:id/deactivate')
  deactivateUser(@Param('id') id: string, @CurrentUser() admin: RequestUser) {
    return this.adminService.setUserActive(id, admin, false);
  }
}
