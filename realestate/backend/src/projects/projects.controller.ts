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
import { CreateProjectDto } from './dto/create-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query() query: QueryProjectDto) {
    return this.projectsService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard, RolesGuard)
  @Roles(RealRole.OWNER)
  @Get('mine/list')
  findMine(@CurrentUser() user: RequestUser) {
    return this.projectsService.findMine(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard, RolesGuard)
  @Roles(RealRole.OWNER)
  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard, RolesGuard)
  @Roles(RealRole.OWNER)
  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: RequestUser, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, user, dto);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard, RolesGuard)
  @Roles(RealRole.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.projectsService.remove(id, user);
  }
}
