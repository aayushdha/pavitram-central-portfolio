import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessBuyersService } from './business-buyers.service';
import { CreateBusinessBuyerDto } from './dto/create-business-buyer.dto';
import { UpdateBusinessBuyerDto } from './dto/update-business-buyer.dto';

@ApiTags('business-buyers')
@Controller('business-buyers')
export class BusinessBuyersController {
  constructor(private readonly service: BusinessBuyersService) {}

  @Post()
  create(@Body() dto: CreateBusinessBuyerDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List business buyers — filter by segment, status, search; paginated' })
  findAll(
    @Query('search') search?: string,
    @Query('segment') segment?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      search,
      segment,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one business buyer, including its team members' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBusinessBuyerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
