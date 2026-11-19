import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateGstSummaryDto {
  @ApiProperty()
  @IsString()
  state: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hsn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gstCollected?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  invoicesIRN?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
