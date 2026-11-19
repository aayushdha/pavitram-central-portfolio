import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CentralAuthGuard, RequestUser } from '../common/guards/central-auth.guard';
import { WishlistService } from './wishlist.service';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(CentralAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findMine(@CurrentUser() user: RequestUser) {
    return this.wishlistService.findMine(user.id);
  }

  @Post(':propertyId')
  add(@CurrentUser() user: RequestUser, @Param('propertyId') propertyId: string) {
    return this.wishlistService.add(user.id, propertyId);
  }

  @Delete(':propertyId')
  remove(@CurrentUser() user: RequestUser, @Param('propertyId') propertyId: string) {
    return this.wishlistService.remove(user.id, propertyId);
  }
}
