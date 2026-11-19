import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class TierPricingDto {
  @ApiProperty({ description: 'Minimum quantity for this price slab' })
  @IsInt()
  @Min(0)
  min: number;

  @ApiPropertyOptional({ description: 'Maximum quantity for this slab (omit/null = unbounded, i.e. "and above")' })
  @IsOptional()
  @IsInt()
  @Min(0)
  max?: number | null;

  @ApiProperty({ description: 'Unit price for this quantity slab' })
  @IsNumber()
  price: number;
}
