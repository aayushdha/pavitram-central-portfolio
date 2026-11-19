import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CalculateGstDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  taxableAmount: number;

  @ApiPropertyOptional({ description: 'Defaults to 18%' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gstRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorState?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerState?: string;
}
