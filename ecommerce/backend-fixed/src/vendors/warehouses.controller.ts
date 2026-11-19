import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { WarehouseDto } from './dto/warehouse.dto';

@ApiTags('vendors / warehouses')
@Controller('vendors/:vendorId/warehouses')
export class WarehousesController {
  constructor(private readonly service: WarehousesService) {}

  @Get()
  findAll(@Param('vendorId') vendorId: string) {
    return this.service.findAll(vendorId);
  }

  @Post()
  create(@Param('vendorId') vendorId: string, @Body() dto: WarehouseDto) {
    return this.service.create(vendorId, dto);
  }

  @Patch(':warehouseId')
  update(
    @Param('vendorId') vendorId: string,
    @Param('warehouseId') warehouseId: string,
    @Body() dto: WarehouseDto,
  ) {
    return this.service.update(vendorId, warehouseId, dto);
  }

  @Delete(':warehouseId')
  remove(@Param('vendorId') vendorId: string, @Param('warehouseId') warehouseId: string) {
    return this.service.remove(vendorId, warehouseId);
  }
}
