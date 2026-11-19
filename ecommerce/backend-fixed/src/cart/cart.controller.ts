import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly service: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Add an item to the cart. Same product+variant for the same user gets its qty bumped instead of duplicated.' })
  add(@Body() dto: AddCartItemDto) {
    return this.service.add(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List cart items, optionally filtered by userId' })
  findAll(@Query('userId') userId?: string) {
    return this.service.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quantity of a cart item. qty=0 removes it.' })
  update(@Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.service.update(id, dto);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear the whole cart, optionally scoped to a userId' })
  clear(@Query('userId') userId?: string) {
    return this.service.clear(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
