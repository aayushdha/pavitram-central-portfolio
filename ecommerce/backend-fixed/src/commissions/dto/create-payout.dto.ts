import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePayoutDto {
  @ApiProperty()
  @IsString()
  vendorId: string;

  @ApiPropertyOptional({ enum: ['B2C', 'B2B', 'Both'] })
  @IsOptional()
  @IsIn(['B2C', 'B2B', 'Both'])
  channel?: string;

  @ApiProperty()
  @IsString()
  periodFrom: string;

  @ApiProperty()
  @IsString()
  periodTo: string;

  @ApiProperty()
  @IsNumber()
  grossSales: number;

  @ApiProperty()
  @IsNumber()
  commission: number;

  @ApiProperty()
  @IsNumber()
  netPayout: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
