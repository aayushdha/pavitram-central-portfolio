import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HeroStatsService } from './hero-stats.service';
import { CreateHeroStatDto } from './dto/create-hero-stat.dto';
import { UpdateHeroStatDto } from './dto/update-hero-stat.dto';

@ApiTags('hero-stats')
@Controller('hero-stats')
export class HeroStatsController {
  constructor(private readonly service: HeroStatsService) {}

  @Post()
  create(@Body() dto: CreateHeroStatDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateHeroStatDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
