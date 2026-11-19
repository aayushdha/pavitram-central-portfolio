import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class WarehouseDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  pincode: string;

  @ApiPropertyOptional({ description: 'e.g. "B2C + B2B" or "B2B only"' })
  @IsOptional()
  @IsString()
  priority?: string;
}
