import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { SetPriceAlertDto } from './dto/set-price-alert.dto';

@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  @Post()
  @ApiOperation({ summary: 'Save a product to the wishlist (idempotent — no duplicate if already saved)' })
  add(@Body() dto: AddWishlistItemDto) {
    return this.service.add(dto);
  }

  @Get('price-drops')
  @ApiOperation({ summary: 'Wishlist items whose product price has dropped to/below the saved alert price' })
  priceDrops(@Query('userId') userId?: string) {
    return this.service.priceDrops(userId);
  }

  @Patch(':id/price-alert')
  @ApiOperation({ summary: 'Set or clear the price-drop alert target on a wishlist item' })
  setPriceAlert(@Param('id') id: string, @Body() dto: SetPriceAlertDto) {
    return this.service.setPriceAlert(id, dto);
  }

  @Patch(':id/acknowledge-drop')
  @ApiOperation({ summary: 'Mark a price-drop alert as seen/notified' })
  acknowledgeDrop(@Param('id') id: string) {
    return this.service.acknowledgeDrop(id);
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle a product in/out of the wishlist — adds if absent, removes if present' })
  toggle(@Body() dto: AddWishlistItemDto) {
    return this.service.toggle(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List wishlist items, optionally filtered by userId' })
  findAll(@Query('userId') userId?: string) {
    return this.service.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear the whole wishlist, optionally scoped to a userId' })
  clear(@Query('userId') userId?: string) {
    return this.service.clear(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
