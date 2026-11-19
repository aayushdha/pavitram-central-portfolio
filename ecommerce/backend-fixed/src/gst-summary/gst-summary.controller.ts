import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GstSummaryService } from './gst-summary.service';
import { CreateGstSummaryDto } from './dto/create-gst-summary.dto';
import { UpdateGstSummaryDto } from './dto/update-gst-summary.dto';

@ApiTags('gst-summary')
@Controller('gst-summary')
export class GstSummaryController {
  constructor(private readonly service: GstSummaryService) {}

  @Post()
  create(@Body() dto: CreateGstSummaryDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateGstSummaryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
