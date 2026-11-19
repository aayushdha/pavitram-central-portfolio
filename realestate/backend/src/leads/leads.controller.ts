import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RealRole } from '@prisma/client';
import { CentralAuthGuard, RequestUser } from '../common/guards/central-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(CentralAuthGuard, RolesGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(user, dto);
  }

  @Roles(RealRole.OWNER)
  @Get('mine/list')
  findMine(@CurrentUser() user: RequestUser, @Query('stage') stage?: string) {
    return this.leadsService.findMine(user.id, stage);
  }

  @Roles(RealRole.OWNER)
  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: RequestUser, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, user, dto);
  }

  @Roles(RealRole.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.leadsService.remove(id, user);
  }
}
