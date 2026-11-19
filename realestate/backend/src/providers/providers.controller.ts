import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CentralAuthGuard, RequestUser } from '../common/guards/central-auth.guard';
import { QueryProviderDto } from './dto/query-provider.dto';
import { UpsertProviderProfileDto } from './dto/upsert-provider-profile.dto';
import { ProvidersService } from './providers.service';

@ApiTags('providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  findAll(@Query() query: QueryProviderDto) {
    return this.providersService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard)
  @Get('mine/profile')
  findMine(@CurrentUser() user: RequestUser) {
    return this.providersService.findMine(user.id);
  }

  @ApiBearerAuth()
  @UseGuards(CentralAuthGuard)
  @Put('mine/profile')
  upsertMyProfile(@CurrentUser() user: RequestUser, @Body() dto: UpsertProviderProfileDto) {
    return this.providersService.upsertMyProfile(user, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(id);
  }
}
