import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RealRole } from '@prisma/client';
import { CentralAuthGuard, RequestUser } from '../common/guards/central-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreatePropertyDto } from './dto/create-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesService } from './properties.service';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll(@Query() query: QueryPropertyDto) {
    return this.propertiesService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard, RolesGuard)
  @Roles(RealRole.OWNER)
  @Get('mine/list')
  findMine(@CurrentUser() user: RequestUser) {
    return this.propertiesService.findMine(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard, RolesGuard)
  @Roles(RealRole.OWNER)
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard, RolesGuard)
  @Roles(RealRole.OWNER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard, RolesGuard)
  @Roles(RealRole.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.propertiesService.remove(id, user);
  }
}
