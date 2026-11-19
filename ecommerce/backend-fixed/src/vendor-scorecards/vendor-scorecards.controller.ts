import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VendorScorecardsService } from './vendor-scorecards.service';
import { CreateVendorScorecardDto } from './dto/create-vendor-scorecard.dto';
import { UpdateVendorScorecardDto } from './dto/update-vendor-scorecard.dto';

@ApiTags('vendor-scorecards')
@Controller('vendor-scorecards')
export class VendorScorecardsController {
  constructor(private readonly service: VendorScorecardsService) {}

  @Post()
  create(@Body() dto: CreateVendorScorecardDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateVendorScorecardDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
