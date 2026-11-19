import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddWishlistItemDto {
  @ApiPropertyOptional({ description: 'Owning user id. Omit for a guest/anonymous wishlist item.' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty()
  @IsString()
  productId: string;

  @ApiPropertyOptional({ description: 'Notify me when the price drops to/below this value' })
  @IsOptional()
  @IsNumber()
  alertPrice?: number;
}
