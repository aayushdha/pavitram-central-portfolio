import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CentralAuthGuard, RequestUser } from '../common/guards/central-auth.guard';
import { CreateSiteVisitDto } from './dto/create-site-visit.dto';
import { UpdateSiteVisitDto } from './dto/update-site-visit.dto';
import { SiteVisitsService } from './site-visits.service';

@ApiTags('site-visits')
@ApiBearerAuth()
@UseGuards(CentralAuthGuard)
@Controller('site-visits')
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateSiteVisitDto) {
    return this.siteVisitsService.create(user, dto);
  }

  @Get('mine/as-seeker')
  findMineAsSeeker(@CurrentUser() user: RequestUser) {
    return this.siteVisitsService.findMineAsSeeker(user.id);
  }

  @Get('mine/as-host')
  findMineAsHost(@CurrentUser() user: RequestUser) {
    return this.siteVisitsService.findMineAsHost(user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: RequestUser, @Body() dto: UpdateSiteVisitDto) {
    return this.siteVisitsService.update(id, user, dto);
  }
}
