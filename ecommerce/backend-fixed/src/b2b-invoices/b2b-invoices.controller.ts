import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { B2bInvoicesService } from './b2b-invoices.service';
import { CreateB2bInvoiceDto } from './dto/create-b2b-invoice.dto';
import { UpdateB2bInvoiceDto } from './dto/update-b2b-invoice.dto';

@ApiTags('b2b-invoices')
@Controller('b2b-invoices')
export class B2bInvoicesController {
  constructor(private readonly service: B2bInvoicesService) {}

  @Post()
  create(@Body() dto: CreateB2bInvoiceDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateB2bInvoiceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
