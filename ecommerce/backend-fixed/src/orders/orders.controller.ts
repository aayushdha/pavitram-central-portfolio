import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AddTrackingEventDto } from './dto/add-tracking-event.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place an order. Auto-generates a "PVT-xxxxx" id if none given, and clears the cart for userId if provided.' })
  create(@Body() dto: CreateOrderDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders — filter by type (B2C/B2B), status, search; paginated' })
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      search,
      type,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/tracking')
  @ApiOperation({
    summary:
      'Vendor confirms / advances an order (Confirmed by Vendor, Packed, Shipped, Out for Delivery, Delivered, Cancelled). ' +
      'Appends to the order\'s trackingHistory timeline and updates trackingStatus. Pair with PATCH /orders/:id { deliveryDate } when confirming.',
  })
  addTracking(@Param('id') id: string, @Body() dto: AddTrackingEventDto) {
    return this.service.addTrackingEvent(id, dto);
  }
}
