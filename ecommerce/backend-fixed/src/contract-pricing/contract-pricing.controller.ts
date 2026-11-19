import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContractPricingService } from './contract-pricing.service';
import { CreateContractPricingDto } from './dto/create-contract-pricing.dto';
import { UpdateContractPricingDto } from './dto/update-contract-pricing.dto';

@ApiTags('contract-pricing')
@Controller('contract-pricing')
export class ContractPricingController {
  constructor(private readonly service: ContractPricingService) {}

  @Post()
  create(@Body() dto: CreateContractPricingDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateContractPricingDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
