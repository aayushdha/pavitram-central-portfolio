import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SampleOrdersService } from './sample-orders.service';
import { CreateSampleOrderDto } from './dto/create-sample-order.dto';
import { UpdateSampleOrderDto } from './dto/update-sample-order.dto';

@ApiTags('sample-orders')
@Controller('sample-orders')
export class SampleOrdersController {
  constructor(private readonly service: SampleOrdersService) {}

  @Post()
  create(@Body() dto: CreateSampleOrderDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateSampleOrderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
