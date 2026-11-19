import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GmvTrendsService } from './gmv-trends.service';
import { CreateGmvTrendDto } from './dto/create-gmv-trend.dto';
import { UpdateGmvTrendDto } from './dto/update-gmv-trend.dto';

@ApiTags('gmv-trends')
@Controller('gmv-trends')
export class GmvTrendsController {
  constructor(private readonly service: GmvTrendsService) {}

  @Post()
  create(@Body() dto: CreateGmvTrendDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateGmvTrendDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
