import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VendorReviewsService } from './vendor-reviews.service';
import { CreateVendorReviewDto } from './dto/create-vendor-review.dto';
import { UpdateVendorReviewDto } from './dto/update-vendor-review.dto';

@ApiTags('vendor-reviews')
@Controller('vendor-reviews')
export class VendorReviewsController {
  constructor(private readonly service: VendorReviewsService) {}

  @Post()
  create(@Body() dto: CreateVendorReviewDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List vendor reviews — filter by vendorId, search; paginated' })
  findAll(
    @Query('vendorId') vendorId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      vendorId,
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
  update(@Param('id') id: string, @Body() dto: UpdateVendorReviewDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
