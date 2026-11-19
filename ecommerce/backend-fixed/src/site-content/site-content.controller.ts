import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteContentService } from './site-content.service';
import { UpsertSiteContentDto } from './dto/upsert-site-content.dto';

@ApiTags('site-content (homepage CMS)')
@Controller('site-content')
export class SiteContentController {
  constructor(private readonly service: SiteContentService) {}

  @Get()
  @ApiOperation({ summary: 'Get every homepage section as a { key: value } map — used by the public homepage' })
  findAll() {
    return this.service.findAllAsMap();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a single homepage section by key, e.g. homepage.hero' })
  findOne(@Param('key') key: string) {
    return this.service.findOne(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Create or replace a homepage section (Admin > CMS > Homepage)' })
  upsert(@Param('key') key: string, @Body() dto: UpsertSiteContentDto) {
    return this.service.upsert(key, dto.value);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Remove a section — homepage will fall back to its built-in default' })
  remove(@Param('key') key: string) {
    return this.service.remove(key);
  }
}
