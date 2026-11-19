import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SecuritySettingsService } from './security-settings.service';
import { CreateSecuritySettingDto } from './dto/create-security-setting.dto';
import { UpdateSecuritySettingDto } from './dto/update-security-setting.dto';

@ApiTags('security-settings')
@Controller('security-settings')
export class SecuritySettingsController {
  constructor(private readonly service: SecuritySettingsService) {}

  @Post()
  create(@Body() dto: CreateSecuritySettingDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('search') search?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSecuritySettingDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
